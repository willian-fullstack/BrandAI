// Script para testar se o endpoint de limpeza de usuário está funcionando
const http = require('http');

const email = 'teste@example.com';
const url = `http://localhost:5000/api/users/debug/clean-users/${email}`;

console.log(`Tentando acessar: ${url}`);

http.get(url, (res) => {
  let data = '';
  
  console.log(`Código de status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('Resposta:', parsedData);
    } catch (e) {
      console.log('Resposta (não é JSON):', data);
    }
  });
}).on('error', (err) => {
  console.error(`Erro: ${err.message}`);
}); 