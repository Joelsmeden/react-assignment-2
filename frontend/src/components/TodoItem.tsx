interface TodoProps {
  todo: { id: string; task: string; done: boolean };
  onDelete: (id: string) => void;
}

export function TodoItem({ todo, onDelete }: TodoProps) {
  return (
    <li>
      <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
        {todo.task}
      </span>
      <button onClick={() => onDelete(todo.id)} style={{ marginLeft: '10px' }}>
        Ta bort
      </button>
    </li>
  );
}
