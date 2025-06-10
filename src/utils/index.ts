export function createPageUrl(pageName: string) {
    // Separa o nome da página dos parâmetros da query
    const [basePage, queryParams] = pageName.split('?');
    
    // Converte o nome da base da página para o formato correto
    const baseUrl = '/' + basePage.toLowerCase().replace(/ /g, '-');
    
    // Retorna a URL completa incluindo os parâmetros se existirem
    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl;
}