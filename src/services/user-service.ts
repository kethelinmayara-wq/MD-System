const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw5O0x0vEf2iGenVt7R4DdiG2vDX8XdOzXswTaq8iuoYoRxLz2cTyInnF5rLhrh7y5KUg/exec';

const request = async (payload: object) => {
  const response = await fetch(SCRIPT_URL, {
    method: 'POST', 
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // Se o Google retornar HTML de erro/redirecionamento em vez de JSON puro
    console.error("Retorno bruto do servidor:", text);
    return { status: 500, mensagem: "Erro no formato de resposta do servidor." };
  }
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