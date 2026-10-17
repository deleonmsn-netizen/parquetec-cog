// Aviso por e-mail do ParqueTEC para a coordenação.
// Como instalar (uma vez só, logado no Gmail da coordenação):
// 1. Abra https://script.google.com e clique em "Novo projeto".
// 2. Apague o que estiver lá, cole todo este arquivo e clique em Salvar.
// 3. Clique em Implantar → Nova implantação → engrenagem → "App da Web".
//    Executar como: "Eu". Quem pode acessar: "Qualquer pessoa". Clique em Implantar e autorize.
// 4. Copie o "URL do app da Web" e coloque no campo avisoEmail do config.js.

const PARA = "gomescomendadoroliveira@gmail.com";
const LIMITE_POR_DIA = 80;

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const hoje = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  const chave = "enviados_" + hoje, enviados = Number(props.getProperty(chave) || 0);
  if (enviados >= LIMITE_POR_DIA) return ContentService.createTextOutput("limite do dia");

  let d = {};
  try { d = JSON.parse(e.postData.contents || "{}"); } catch (err) { return ContentService.createTextOutput("inválido"); }
  const t = (v) => String(v || "").replace(/[\r\n]+/g, " ").slice(0, 300);
  const app = /^https:\/\/[^\s]+$/.test(String(d.app || "")) ? d.app : "";

  let assunto, corpo;
  if (d.tipo === "pedido") {
    assunto = "ParqueTEC: " + t(d.nome) + " pediu acesso ao app";
    corpo = t(d.nome) + " (" + t(d.email) + ") criou uma conta e pediu acesso ao ParqueTEC.\n\n" +
      "Para aprovar, abra o app e vá em Gerenciar → Acessos.\n" + app;
  } else if (d.tipo === "agendamento") {
    assunto = "ParqueTEC: novo agendamento de " + t(d.pessoa);
    corpo = t(d.pessoa) + " agendou equipamentos.\n\n" +
      "Quando: " + t(d.data) + ", " + t(d.aula) + "\n" +
      "O quê: " + t(d.itens) + "\n" +
      (d.turma ? "Turma: " + t(d.turma) + "\n" : "") +
      (d.obs ? "Observação: " + t(d.obs) + "\n" : "") +
      "\nNo dia, libere a retirada pelo Painel → Agendados para hoje.\n" + app;
  } else if (d.tipo === "devolucao") {
    assunto = "ParqueTEC: " + t(d.pessoa) + " marcou uma devolução";
    corpo = t(d.pessoa) + " marcou como devolvido: " + t(d.itens) + "\n" +
      "Códigos: " + t(d.codigos) + "\n\n" +
      "Confira os equipamentos e confirme no app, em Painel → Devoluções para conferir.\n" + app;
  } else {
    return ContentService.createTextOutput("tipo desconhecido");
  }
  MailApp.sendEmail(PARA, assunto, corpo);
  props.setProperty(chave, String(enviados + 1));
  return ContentService.createTextOutput("ok");
}
