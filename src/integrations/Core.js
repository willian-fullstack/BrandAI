import axios from 'axios';

// Configurações para upload de arquivos
export class UploadFile {
  static async upload(file, tipo = 'imagem', pasta = 'geral') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', tipo);
      formData.append('pasta', pasta);
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('userToken');
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
      
      const response = await axios.post(`${API_URL}/upload`, formData, config);
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  }
  
  static getUrlCompleta(caminhoRelativo) {
    if (!caminhoRelativo) return '';
    if (caminhoRelativo.startsWith('http')) return caminhoRelativo;
    
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${API_URL}/uploads/${caminhoRelativo}`;
  }
}
