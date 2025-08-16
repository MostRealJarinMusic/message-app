import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

@Injectable({ providedIn: 'root' })
export class PouchService {
  private db = new PouchDB('messages');

  saveMessage(msg: any) {
    return this.db.put({ _id: new Date().toISOString(), ...msg });
  }

  async getMessages() {
    const result = await this.db.allDocs({ include_docs: true });
    return result.rows.map((r) => r.doc);
  }
}
