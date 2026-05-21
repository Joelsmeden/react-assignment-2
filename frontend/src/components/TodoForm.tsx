import { useState, type SubmitEvent } from 'react';
import type { AddTodo } from '../models/AddTodo.ts';
import type { Contract } from 'ethers';

type AddTodoFormProps = {
  writeContract: Contract;
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

    if (!todo.task.trim()) return; // Skicka inte tomt

    try {
      // 1. Skapa ett unikt ID (precis som i dina tidigare uppgifter)
      const uniqueId = Date.now().toString();

      // 2. Vi gör kontraktanropet DIREKT här istället för i en annan krånglig fil!
      // Vi skickar med ID och själva uppgiften (task) till ditt smarta kontrakt
      const tx = await writeContract.addTodo(uniqueId, todo.task);

      console.log('Transaktion skickad, väntar på blockkedjan...', tx.hash);
      await tx.wait(); // Väntar tills det är sparat på kedjan

      // 3. Om allt gick bra, hämta den uppdaterade listan till skärmen
      getTodosFromChain();
    } catch (error) {
      console.error('Kunde inte spara todo till blockchain:', error);
    }

    // Tömmer formuläret efteråt, precis som du är van vid
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
          // Vi uppdaterar bara 'task'-egenskapen i objektet
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
