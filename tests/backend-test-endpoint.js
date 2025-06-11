import fetch from 'node-fetch';

// Substitua pelo email que deseja testar
const email = 'irontechdollbrasil@gmail.com';
const url = `http://localhost:5000/api/users/debug/clean-users/${email}`;

console.log(`Testando endpoint: ${url}`);

fetch(url)
  .then(response => {
    console.log(`Status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Resposta:', data);
  })
  .catch(error => {
    console.error('Erro:', error);
  }); 