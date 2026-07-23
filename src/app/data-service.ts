import { Service, inject, signal } from '@angular/core';
import type { FrameworksAlignment } from './models/frameworks-alignment';
import { HttpClient } from '@angular/common/http';

@Service()
export class DataService {

    private http = inject(HttpClient);

    frameworksAlignment = signal<FrameworksAlignment[]>([]);

    getFrameworksAlignment() {
        this.http.get<FrameworksAlignment>('data/frameworks-alignment.json')
            .subscribe(data => {
                this.frameworksAlignment.set([data]);
            });
        return this.frameworksAlignment;
    }


}
