// Mock para pg
export class Pool {
  constructor(config?: any) {}

  async query(sql: string, params?: any[]) {
    return { rows: [] };
  }

  async end() {
    // Mock implementation
  }

  on(event: string, callback: Function) {
    // Mock implementation
  }
}

export class Client {
  constructor(config?: any) {}

  async connect() {
    // Mock implementation
  }

  async query(sql: string, params?: any[]) {
    return { rows: [] };
  }

  async end() {
    // Mock implementation
  }
}
