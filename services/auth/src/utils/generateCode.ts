export const generateVerificationCode = () => {
  const timestamp = new Date().getTime().toString();

  const randomNum = Math.floor(10 + Math.random() * 90).toString();

  const code = (timestamp + randomNum).slice(-6);

  return code;
};

