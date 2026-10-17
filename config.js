// Configuração do Firebase (banco de dados na nuvem que junta celular e computador).
// Se trocar por null, o app volta ao "modo de teste", salvando só no aparelho.
// Veja o passo a passo no arquivo LEIA-ME.md.
window.PARQUETEC_FIREBASE = {
  apiKey: "AIzaSyBdRhfaEtocV1wju49HF1FQMto8ogcFBRk",
  authDomain: "teccog-ff300.firebaseapp.com",
  projectId: "teccog-ff300",
  storageBucket: "teccog-ff300.firebasestorage.app",
  messagingSenderId: "534282262824",
  appId: "1:534282262824:web:d4c485e148f421aeb1d81d",
  escola: "principal",
  dono: "gomescomendadoroliveira@gmail.com"   // e-mail da coordenação: é quem libera os acessos no app
};

/* Exemplo de como fica depois de preenchido:
window.PARQUETEC_FIREBASE = {
  apiKey: "AIza...",
  authDomain: "minha-escola.firebaseapp.com",
  projectId: "minha-escola",
  storageBucket: "minha-escola.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  escola: "principal",
  dono: "coordenacao@minhaescola.com.br"   // e-mail da coordenação: é quem libera os acessos no app
};
*/
