export class Indicacao {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.usuarioId = data.usuarioId || '';
    this.usuarioIndicado = data.usuarioIndicado || '';
    this.email = data.email || '';
    this.status = data.status || 'pendente'; // pendente, aceita, rejeitada
    this.dataIndicacao = data.dataIndicacao || new Date().toISOString();
    this.dataConversao = data.dataConversao || null;
    this.comissao = data.comissao || 0;
    this.comissaoPaga = data.comissaoPaga || false;
  }

  static fromAPI(data) {
    return new Indicacao(data);
  }

  static fromList(list = []) {
    return list.map(item => Indicacao.fromAPI(item));
  }
}