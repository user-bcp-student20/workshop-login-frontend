import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ERROR_MESSAGES, Task, User } from '../models';
import { formatTaskLabel } from '../utils/legacy-format';
import { TasksService } from './tasks.service';

const STATUS_LABELS: Record<string, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completado',
  RESUELTO: 'Resuelto',
  COMPLETED: 'Completado'
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  visibleTasks: Task[] = [];
  user: User = {};
  loading = true;
  error = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private auth: AuthService,
    private taskSource: TasksService
  ) {}

  statusLabel(status: string | undefined): string {
    return STATUS_LABELS[(status || '').toUpperCase()] || status || '';
  }

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.taskSource.load();
      if (result.ok === false) {
        this.error = ERROR_MESSAGES[result.error];
        if (result.error === 'no-session') await this.router.navigate(['/login']);
        return;
      }
      const { tasks, user } = result.value;
      const visibleTasks = tasks.filter(task => task.status !== 'ARCHIVED');
      for (const task of visibleTasks) task.label = formatTaskLabel(task);
      visibleTasks.sort((first, second) => {
        if (first.priority === undefined || second.priority === undefined) return 1;
        return first.priority > second.priority ? -1 : 1;
      });
      this.zone.run(() => {
        this.user = user;
        this.tasks = tasks;
        this.visibleTasks = visibleTasks;
      });
    } catch {
      this.error = ERROR_MESSAGES.navigation;
    } finally {
      this.zone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  async logout(): Promise<void> {
    const result = this.auth.logout();
    if (result.ok === false) {
      this.error = ERROR_MESSAGES[result.error];
      return;
    }
    try {
      await this.router.navigate(['/login']);
    } catch {
      this.error = ERROR_MESSAGES.navigation;
    }
  }
}
