const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSHqCFwnaSl9PYo7Cbj3QzcpB_cZHypG8xXTKASEeuF5zAq_GJJd6efmerC8jUviKL/exec';

const request = async (payload: object) => {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return result;
};

export const loginUser = async ({ email, senha }: { email: string; senha: string }) => {
  return await request({
    acao: 'login',
    email,
    senha,
  });
};

export const createUser = async ({ nome, sobrenome, email, senha, telefone }: any) => {
  return await request({
    acao: 'cadastrar_usuario',
    nome,
    sobrenome,
    email,
    senha,
    telefone,
  });
};