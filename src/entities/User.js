export class User {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.nome = data.nome || '';
    this.email = data.email || '';
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.plano = data.plano || 'free';
    this.status = data.status || 'active';
    this.avatarUrl = data.avatarUrl || '';
    this.indicadoPor = data.indicadoPor || null;
    this.limiteConversas = data.limiteConversas || 0;
    this.conversasRestantes = data.conversasRestantes || 0;
  }

  static fromAPI(data) {
    return new User(data);
  }

  static fromList(list = []) {
    return list.map(item => User.fromAPI(item));
  }
} 