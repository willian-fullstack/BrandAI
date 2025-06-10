import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Tenta encontrar e ler um arquivo a partir de diferentes caminhos possíveis
 * @param {string} filePath - Caminho original do arquivo
 * @returns {Object} - Objeto com informações sobre o arquivo encontrado e seu conteúdo
 */
export const findAndReadFile = (filePath) => {
  const result = {
    found: false,
    content: null,
    path: null,
    error: null
  };

  // Lista de caminhos possíveis para tentar
  const pathsToTry = [
    filePath,
    path.join(rootDir, filePath),
    path.join(rootDir, filePath.replace(/^\//, '')),
    path.resolve(rootDir, filePath),
    path.resolve(filePath),
    // Adicionar mais possíveis caminhos
    path.join(rootDir, 'uploads', path.basename(filePath)),
    path.join(rootDir, 'uploads', 'training', path.basename(filePath)),
    path.join(rootDir, 'uploads', 'files', path.basename(filePath)),
    // Tentar apenas com o nome do arquivo, ignorando o caminho
    path.join(rootDir, 'uploads', 'training', 'marketing_midias_sociais', path.basename(filePath))
  ];

  console.log(`Tentando encontrar arquivo: ${filePath}`);
  console.log(`Nome do arquivo: ${path.basename(filePath)}`);
  
  // Listar todos os arquivos nos diretórios de uploads para debug
  try {
    const uploadsDir = path.join(rootDir, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log('Conteúdo do diretório uploads:');
      listFiles(uploadsDir, 1);
    }
  } catch (error) {
    console.warn('Erro ao listar diretório uploads:', error.message);
  }

  for (const pathToTry of pathsToTry) {
    try {
      if (fs.existsSync(pathToTry)) {
        console.log(`Arquivo encontrado em: ${pathToTry}`);
        result.content = fs.readFileSync(pathToTry, 'utf8');
        result.found = true;
        result.path = pathToTry;
        return result;
      }
    } catch (error) {
      console.warn(`Erro ao verificar caminho ${pathToTry}:`, error.message);
    }
  }

  // Busca recursiva em todos os subdiretórios de uploads
  try {
    const uploadsDir = path.join(rootDir, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const foundPath = findFileRecursive(uploadsDir, path.basename(filePath));
      if (foundPath) {
        console.log(`Arquivo encontrado em busca recursiva: ${foundPath}`);
        result.content = fs.readFileSync(foundPath, 'utf8');
        result.found = true;
        result.path = foundPath;
        return result;
      }
    }
  } catch (error) {
    console.warn('Erro na busca recursiva:', error.message);
  }

  result.error = `Arquivo não encontrado em nenhum dos caminhos testados`;
  return result;
};

/**
 * Lista recursivamente todos os arquivos em um diretório
 * @param {string} dir - Diretório a ser listado
 * @param {number} level - Nível de profundidade (para indentação)
 */
function listFiles(dir, level = 0) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      const indent = '  '.repeat(level);
      
      if (stats.isDirectory()) {
        console.log(`${indent}📁 ${item}`);
        listFiles(itemPath, level + 1);
      } else {
        console.log(`${indent}📄 ${item}`);
      }
    }
  } catch (error) {
    console.warn(`Erro ao listar diretório ${dir}:`, error.message);
  }
}

/**
 * Busca recursivamente por um arquivo em um diretório
 * @param {string} dir - Diretório para buscar
 * @param {string} filename - Nome do arquivo a encontrar
 * @returns {string|null} - Caminho do arquivo se encontrado, ou null
 */
function findFileRecursive(dir, filename) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        const found = findFileRecursive(itemPath, filename);
        if (found) return found;
      } else if (item === filename || item.toLowerCase() === filename.toLowerCase()) {
        return itemPath;
      }
    }
  } catch (error) {
    console.warn(`Erro ao buscar em ${dir}:`, error.message);
  }
  return null;
}

/**
 * Resolve um caminho de arquivo relativo para o sistema de arquivos
 * @param {string} urlPath - Caminho de URL (como /uploads/...)
 * @returns {string} - Caminho absoluto no sistema de arquivos
 */
export const resolveFilePath = (urlPath) => {
  if (urlPath.startsWith('/uploads')) {
    return path.join(rootDir, urlPath);
  }
  return urlPath;
}; 