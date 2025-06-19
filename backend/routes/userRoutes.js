import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
  refreshAccessToken,
  logoutUser,
  generateAdminConfirmationToken,
} from '../controllers/userController.js';
import { protect, admin, criticalAdminOperation } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Rotas públicas
router.post('/login', authUser);
router.post('/', registerUser);
router.post('/password-reset-request', requestPasswordReset);
router.post('/password-reset', resetPassword);
router.post('/refresh-token', refreshAccessToken);

// Rotas protegidas
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/change-password')
  .post(protect, changePassword);

router.post('/logout', protect, logoutUser);

// Rota para gerar token de confirmação para operações críticas
router.post('/admin/generate-confirmation', protect, admin, generateAdminConfirmationToken);

// Rotas de admin
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .delete(protect, admin, criticalAdminOperation, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, criticalAdminOperation, updateUser);

// Rota administrativa para remover usuários por email
router.get('/admin/remove-user-by-email/:email', protect, admin, criticalAdminOperation, async (req, res) => {
  const { email } = req.params;
  
  try {
    console.log(`Admin ${req.user.email} tentando remover usuário com email: ${email}`);
    
    // Primeiro verificar se o usuário existe
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`Usuário com email ${email} não encontrado`);
      return res.status(404).json({ message: `Usuário com email ${email} não encontrado` });
    }
    
    // Remover o usuário
    await User.deleteOne({ email });
    console.log(`Usuário com email ${email} removido com sucesso pelo admin ${req.user.email}`);
    
    res.json({ message: `Usuário com email ${email} removido com sucesso` });
  } catch (error) {
    console.error(`Erro ao remover usuário: ${error.message}`);
    res.status(500).json({ 
      message: 'Erro ao remover usuário', 
      error: 'Erro interno do servidor'
    });
  }
});

export default router; 