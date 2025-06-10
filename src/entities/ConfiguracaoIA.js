export class ConfiguracaoIA {
  constructor(data = {}) {
    this.id = data.id || data._id || '';
    this.chaveOpenAI = data.chaveOpenAI || '';
    this.chaveAnthropic = data.chaveAnthropic || '';
    this.chaveGoogleAI = data.chaveGoogleAI || '';
    this.organizacaoOpenAI = data.organizacaoOpenAI || '';
    this.modeloPadrao = data.modeloPadrao || 'gpt-3.5-turbo';
    this.limiteTokens = data.limiteTokens || 4000;
    this.temperaturaGlobal = data.temperaturaGlobal || 0.7;
    this.provedorPadrao = data.provedorPadrao || 'openai';
    this.contextoPadrao = data.contextoPadrao || '';
  }

  static fromAPI(data) {
    return new ConfiguracaoIA(data);
  }
}