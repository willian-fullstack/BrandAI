export class Conversa {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.usuarioId = data.usuarioId || '';
    this.agenteId = data.agenteId || '';
    this.titulo = data.titulo || 'Nova conversa';
    this.mensagens = data.mensagens || [];
    this.criadaEm = data.criadaEm || new Date().toISOString();
    this.atualizadaEm = data.atualizadaEm || new Date().toISOString();
    this.status = data.status || 'ativa'; // ativa, arquivada, excluída
    this.tokensConta = data.tokensConta || 0;
    this.nomAgente = data.nomeAgente || '';
  }

  static fromAPI(data) {
    return new Conversa(data);
  }

  static fromList(list = []) {
    return list.map(item => Conversa.fromAPI(item));
  }
}