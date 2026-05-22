import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TodoItem } from './components/TodoItem.tsx';
import { abi, adress } from './config';
import './App.css';

interface Todo {
  id: string;
  task: string;
  done: boolean;
}

function App() {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [readContract, setReadContract] = useState<any>();
  const [writeContract, setWriteContract] = useState<any>();
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved: string | null = localStorage.getItem('my_todos');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return [];
  });

  const initWallet = async () => {
    const customWindow = window as any;

    if (typeof customWindow.ethereum !== 'undefined') {
      try {
        const accounts = await customWindow.ethereum.request({
          method: 'eth_requestAccounts',
        });
        const userAddress = accounts[0];
        setAccount(userAddress);

        const provider = new ethers.providers.Web3Provider(
          customWindow.ethereum,
        );

        const rawBalance = await provider.getBalance(userAddress);
        const formattedBalance = ethers.utils.formatEther(rawBalance);
        setBalance(parseFloat(formattedBalance).toFixed(4));

        const _readContract = new ethers.Contract(adress, abi, provider);
        setReadContract(_readContract);

        const signer = provider.getSigner();
        const _writeContract = new ethers.Contract(adress, abi, signer);
        setWriteContract(_writeContract);
      } catch (error) {
        console.error('Kunde inte hämta plånboksinfo:', error);
      }
    } else {
      console.log('Installera MetaMask!');
    }
  };

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
    initWallet();
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

export default App;
