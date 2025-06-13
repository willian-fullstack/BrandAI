export function createPageUrl(pageName: string) {
    // Separa o nome da página dos parâmetros da query
    const [basePage, queryParams] = pageName.split('?');
    
    // Converte o nome da base da página para o formato correto
    let baseUrl = basePage.toLowerCase().replace(/ /g, '-');
    
    // Tratamento especial para o Dashboard (para evitar /app/dashboard)
    if (baseUrl === 'dashboard') {
        baseUrl = '/app';
    } 
    // Tratamento para página Home
    else if (baseUrl === 'home') {
        baseUrl = '/';
    }
    // Para todas as outras páginas
    else {
        baseUrl = '/app/' + baseUrl;
    }
    
    // Retorna a URL completa incluindo os parâmetros se existirem
    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
}