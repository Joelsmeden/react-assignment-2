import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TodoItem } from './components/TodoItem.tsx';
import { AddTodoForm } from './components/TodoForm.tsx';
import { abi, adress } from './config';
import './App.css';

interface Todo {
  id: string;
  task: string;
  done: boolean;
}
declare global {
  interface Window {
    ethereum?: any;
  }
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

  const getTodosFromChain = async () => {
    if (!readContract) return;

    try {
      const count = await readContract.todoCount();
      const loadedTodos = [];

      // Loopa igenom alla sparade todos på kedjan
      for (let i = 1; i <= count; i++) {
        const t = await readContract.todos(i);

        if (t.id.toString() !== '0') {
          loadedTodos.push({
            id: t.id.toString(),
            task: t._content,
            done: t.done,
          });
        }
      }

      setTodos(loadedTodos);
    } catch (error) {
      console.error('Kunde inte hämta listan från blockkedjan:', error);
    }
  };

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

  const removeTodo = async (id: string) => {
    if (!writeContract) return;

    try {
      const tx = await writeContract.removeTodo(Number(id));

      await tx.wait();
      await getTodosFromChain();
    } catch (error) {
      console.error('Kunde inte ta bort todo från blockkedjan:', error);
    }
  };

  useEffect(() => {
    async function checkExistingConnection() {
      const provider = (window as any).ethereum;
      if (provider) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (err) {
          console.error('Kunde inte kontrollera befintlig anslutning:', err);
        }
      }
    }
    checkExistingConnection();
    if (account) {
      initWallet();
    }
  }, [account]);

  useEffect(() => {
    async function fetchTodosFromChain() {
      if (!readContract) return;

      try {
        const count = await readContract.todoCount();
        const loadedTodos = [];

        for (let i = 1; i <= count; i++) {
          const t = await readContract.todos(i);

          if (t.id.toString() !== '0') {
            loadedTodos.push({
              id: t.id.toString(),
              task: t._content,
              done: t.done,
            });
          }
        }

        setTodos(loadedTodos);
      } catch (error) {
        console.error('Kunde inte hämta från kedjan:', error);
      }
    }

    fetchTodosFromChain();
  }, [readContract]);

  return (
    <>
      {account === '' ? (
        <button
          onClick={async () => {
            const provider = (window as any).ethereum;

            if (provider) {
              try {
                // Nu vet koden exakt vad provider är!
                const accounts = await provider.request({
                  method: 'eth_requestAccounts',
                });

                setAccount(accounts[0]);
              } catch (err) {
                console.error('Användaren nekade anslutningen:', err);
              }
            } else {
              alert(
                'Ingen Web3-plånbok hittades! Se till att din plånbok är aktiverad.',
              );
            }
          }}
          style={{
            padding: '10px 20px',
            marginBottom: '20px',
            cursor: 'pointer',
          }}
        >
          Anslut Plånbok Manuellt
        </button>
      ) : null}
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

        {writeContract && (
          <AddTodoForm
            writeContract={writeContract}
            getTodosFromChain={initWallet}
          />
        )}

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
