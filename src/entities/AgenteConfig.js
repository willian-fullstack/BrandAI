export class AgenteConfig {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.codigo = data.codigo || '';
    this.nome = data.nome || '';
    this.descricao = data.descricao || '';
    this.prompt = data.prompt || '';
    this.imagem = data.imagem || '';
    this.modelo = data.modelo || 'gpt-3.5-turbo';
    this.temperatura = data.temperatura || 0.7;
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    this.cor = data.cor || 'from-blue-500 to-cyan-600';
    this.icone = data.icone || '🤖';
    this.ordem = data.ordem || 0;
    this.visivel = data.visivel !== undefined ? data.visivel : true;
    this.categoria = data.categoria || 'geral';
    this.planosPermitidos = data.planosPermitidos || ['basic', 'pro', 'enterprise'];
  }

  static fromAPI(data) {
    return new AgenteConfig(data);
  }

  static fromList(list = []) {
    return list.map(item => AgenteConfig.fromAPI(item));
  }
}