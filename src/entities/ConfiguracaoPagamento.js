export class ConfiguracaoPagamento {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.chavePixPagamentos = data.chavePixPagamentos || '';
    this.tipoChavePix = data.tipoChavePix || 'email';
    this.chaveMercadoPago = data.chaveMercadoPago || '';
    this.chaveStripe = data.chaveStripe || '';
    this.comissaoAfiliados = data.comissaoAfiliados || 10;
    this.tempoExpiracao = data.tempoExpiracao || 30; // em minutos
    this.ativo = data.ativo !== undefined ? data.ativo : true;
    this.modoTeste = data.modoTeste !== undefined ? data.modoTeste : true;
    this.webhookUrl = data.webhookUrl || '';
  }

  static fromAPI(data) {
    return new ConfiguracaoPagamento(data);
  }
}