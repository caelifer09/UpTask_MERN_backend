import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos

    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const info = await transport.sendMail({
        from: 'UpTask - Administrador de proyectos <cuentas@uptask.com>',
        to: email,
        subject: "Uptask confirma tu cuenta",
        text: "Comprueba tu cuenta en uptask",
        html:`<p>Hola: ${nombre}! comprueba tu cuenta en uptask </p>
            <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comfirma Aqui</a>
            <p>si no creaste esta cuenta tu, solo ignoralo, nosotros nos encargamos del resto</p>
        `
    })
}

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos

  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  const info = await transport.sendMail({
      from: 'UpTask - Administrador de proyectos <cuentas@uptask.com>',
      to: email,
      subject: "Uptask Restablece tu password",
      text: "Comprueba tu cuenta en uptask",
      html:`<p>Hola: ${nombre}! has solicitado restablecer tu password en uptask </p>
          <p>para crear una nueva password haz click en el siguiente enlace:</p>
          <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">haz click Aqui</a>
          <p>si no haz solicitado cambiar tu password, solo ignoralo, nosotros nos encargamos del resto</p>
      `
  })
}