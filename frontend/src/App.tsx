import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TodoItem } from './components/TodoItem.tsx';
import './App.css';

interface Todo {
  id: string;
  task: string;
  done: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved: string | null = localStorage.getItem('my_todos');

    if (saved !== null) {
      const parsedData: Todo[] = JSON.parse(saved);
      return parsedData;
    }

    return [];
  });

  const removeTodo = (id: string) => {
    const updatedTodos: Todo[] = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);

    localStorage.setItem('my_todos', JSON.stringify(updatedTodos));
  };

  useEffect(() => {
    async function fetchTodos() {
      if (todos.length > 0) return;

      try {
        const response = await fetch(
          'https://random-todos.azurewebsites.net/todos?apikey=$2a$10$w3SJJyaqZ6x6kgg0XStRp.LCs15HUzlTnQTyp8H0pXv8zTim0GSIG',
        );
        const data: Todo[] = await response.json();

        setTodos(data);
        localStorage.setItem('my_todos', JSON.stringify(data));
      } catch (error) {
        console.error('Fel vid hämtning:', error);
      }
    }

    fetchTodos();
  }, []);

  return (
    <>
      <div className='wallet-info'>
        <p>
          <strong>Konto:</strong> {account ? account : 'Ej ansluten'}
        </p>
        <p>
          <strong>Balans:</strong> {account ? `${balance} ETH` : '0 ETH'}
        </p>
      </div>
      <div className='app-container'>
        <h1>Min Todo-lista</h1>
        <ul>
          {todos.map((t) => (
            <TodoItem key={t.id} todo={t} onDelete={removeTodo} />
          ))}
        </ul>
      </div>
    </>
  );
}

//Nya ändringarna

const [account, setAccount] = useState<string>('');
const [balance, setBalance] = useState<string>('');

// Denna funktion körs efter att användaren har anslutit sin MetaMask
const getWalletInfo = async (userAddress: string, currentProvider: any) => {
  setAccount(userAddress);

  // 1. Hämta balansen i "Wei" (blockkedjans minsta enhet)
  const rawBalance = await currentProvider.getBalance(userAddress);

  // 2. Gör om Wei till vanlig ETH (t.ex. 100.0 ETH)
  const formattedBalance = ethers.utils.formatEther(rawBalance);

  // 3. Spara och runda av till 4 decimaler för snyggare design
  setBalance(parseFloat(formattedBalance).toFixed(4));
};

export default App;
