import { useState, type SubmitEvent } from 'react';
import { ethers } from 'ethers';
import type { AddTodo } from '../models/AddTodo.ts';

type AddTodoFormProps = {
  writeContract: ethers.Contract;
  getTodosFromChain: () => void;
};

export const AddTodoForm = ({
  writeContract,
  getTodosFromChain,
}: AddTodoFormProps) => {
  const [todo, setTodo] = useState<AddTodo>({
    id: '',
    task: '',
    done: false,
  });

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!todo.task.trim()) return;

    try {
      const tx = await writeContract.addTodo(todo.task);

      console.log('Transaktion skickad, väntar på blockkedjan...', tx.hash);

      await tx.wait();

      if (getTodosFromChain) {
        await getTodosFromChain();
      }
    } catch (error) {
      console.error('Kunde inte spara todo till blockchain:', error);
    }

    setTodo({
      id: '',
      task: '',
      done: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: '20px 0' }}>
      <div>
        <label htmlFor='task'>Ny uppgift: </label>
        <input
          type='text'
          id='task'
          placeholder='Vad behöver du göra?'
          value={todo.task}
          onChange={(e) => setTodo({ ...todo, task: e.target.value })}
          style={{ padding: '8px', marginRight: '10px', width: '250px' }}
        />
        <button type='submit' style={{ padding: '8px 15px' }}>
          Spara på kedjan
        </button>
      </div>
    </form>
  );
};
