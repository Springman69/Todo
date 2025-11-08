  import { CommonModule } from '@angular/common';
  import { Component, signal } from '@angular/core';
  import { FormsModule } from '@angular/forms';

  type Filter = 'all' | 'active' | 'done';

  interface Todo {
    id: number;
    text: string;
    done: boolean;
    createdAt: number;
  }

  @Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
  })
  export class AppComponent {
    title = 'Twoja Lista Zadań';
    todos = signal<Todo[]>(this.load());
    filter = signal<Filter>('all');
    newText = '';
    editingId: number | null = null;
    editText = '';

    get leftCount() {
      return this.todos().filter(t => !t.done).length;
    }

    filteredTodos() {
      const f = this.filter();
      const list = this.todos();
      if (f === 'active') return list.filter(t => !t.done);
      if (f === 'done') return list.filter(t => t.done);
      return list;
    }

    add() {
      const text = this.newText.trim();
      if (!text) return;
      const next: Todo = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        text,
        done: false,
        createdAt: Date.now()
      };
      this.todos.set([next, ...this.todos()]);
      this.newText = '';
      this.save();
    }

    onDoneChange(todo: Todo, done: boolean) {
      this.todos.set(this.todos().map(t => t.id === todo.id ? { ...t, done } : t));
      this.save();
    }

    remove(todo: Todo) {
      this.todos.set(this.todos().filter(t => t.id !== todo.id));
      this.save();
    }

    clearDone() {
      this.todos.set(this.todos().filter(t => !t.done));
      this.save();
    }

    setFilter(value: Filter) {
      this.filter.set(value);
    }

    toggleAll() {
      const allDone = this.todos().length > 0 && this.todos().every(t => t.done);
      this.todos.set(this.todos().map(t => ({ ...t, done: !allDone })));
      this.save();
    }

    startEdit(todo: Todo) {
      this.editingId = todo.id;
      this.editText = todo.text;
    }

    commitEdit(todo: Todo) {
      const value = this.editText.trim();
      if (!value) {
        this.remove(todo);
        this.editingId = null;
        return;
      }
      this.todos.set(this.todos().map(t => t.id === todo.id ? { ...t, text: value } : t));
      this.editingId = null;
      this.save();
    }

    cancelEdit() {
      this.editingId = null;
    }

    trackById(_: number, todo: Todo) {
      return todo.id;
    }

    save() {
      localStorage.setItem('todos-data', JSON.stringify(this.todos()));
    }

    load(): Todo[] {
      const raw = localStorage.getItem('todos-data');
      try {
        return raw ? JSON.parse(raw) as Todo[] : [];
      } catch {
        return [];
      }
    }
  }