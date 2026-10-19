// Aviso por e-mail do ParqueTEC.
// Como instalar ou atualizar (logado no Gmail da coordenação):
// 1. Abra https://script.google.com e o projeto do ParqueTEC (ou "Novo projeto" na primeira vez).
// 2. Apague o que estiver lá, cole todo este arquivo e clique em Salvar.
// 3. Primeira vez: Implantar → Nova implantação → engrenagem → "App da Web".
//    Executar como: "Eu". Quem pode acessar: "Qualquer pessoa". Implantar e autorizar.
//    Atualização: Implantar → Gerenciar implantações → lápis → Versão: "Nova versão" → Implantar.
//    (Assim o endereço continua o mesmo.)
// 4. Na primeira vez, copie o "URL do app da Web" e coloque no campo avisoEmail do config.js.

const COORDENACAO = "gomescomendadoroliveira@gmail.com";
const APP = "https://deleonmsn-netizen.github.io/parquetec-cog/";
const LIMITE_POR_DIA = 80;        // e-mails no total, por dia
const LIMITE_POR_PESSOA = 6;      // e-mails para o mesmo professor, por dia

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents || "{}"); } catch (err) { return resp("inválido"); }
  const t = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").replace(/https?:\/\/\S+/g, "").slice(0, n || 120);
  const para = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.para || "")) ? String(d.para).toLowerCase() : "";

  let destino = COORDENACAO, assunto, corpo;
  if (d.tipo === "pedido") {
    assunto = "ParqueTEC: " + t(d.nome, 60) + " pediu acesso ao app";
    corpo = t(d.nome, 60) + " (" + t(d.email, 80) + ") criou uma conta e pediu acesso ao ParqueTEC.\n\nPara aprovar, abra o app e vá em Gerenciar → Acessos.";
  } else if (d.tipo === "agendamento") {
    assunto = "ParqueTEC: novo agendamento de " + t(d.pessoa, 60);
    corpo = t(d.pessoa, 60) + " agendou equipamentos.\n\nQuando: " + t(d.data) + ", " + t(d.aula) + "\nO quê: " + t(d.itens, 200) + "\n" +
      (d.turma ? "Turma: " + t(d.turma, 40) + "\n" : "") + (d.obs ? "Observação: " + t(d.obs, 200) + "\n" : "") +
      "\nPara aprovar ou recusar, abra o app em Painel → Agendados para hoje (ou na Agenda, no dia marcado).";
  } else if (d.tipo === "devolucao") {
    assunto = "ParqueTEC: " + t(d.pessoa, 60) + " marcou uma devolução";
    corpo = t(d.pessoa, 60) + " marcou como devolvido: " + t(d.itens, 200) + "\nCódigos: " + t(d.codigos, 300) + "\n" +
      (d.problema ? "Problema relatado: " + t(d.problema, 300) + "\n" : "") +
      "\nConfira os equipamentos e confirme no app, em Painel → Devoluções para conferir.";
  } else if (d.tipo === "atraso" && !para) {
    assunto = "ParqueTEC: devolução atrasada de " + t(d.pessoa, 60);
    corpo = t(d.pessoa, 60) + " ainda não devolveu: " + t(d.itens, 200) + "\nCódigos: " + t(d.codigos, 300) + "\nPrazo era " + t(d.prazo, 40) + ".";
  } else if (d.tipo === "atraso" && para) {
    destino = para; assunto = "ParqueTEC: sua devolução está atrasada";
    corpo = "Olá, " + t(d.pessoa, 60) + ".\n\nOs equipamentos " + t(d.codigos, 300) + " (" + t(d.itens, 200) + ") deviam ter voltado " + t(d.prazo, 40) +
      ".\nPor favor, devolva à coordenação e marque \"Devolvi\" no app.";
  } else if (d.tipo === "aprovado" && para) {
    destino = para; assunto = "ParqueTEC: seu acesso foi liberado";
    corpo = "Olá, " + t(d.nome, 60) + ".\n\nSeu acesso ao ParqueTEC do COG Ensino Integral foi liberado (perfil " + t(d.papel, 20) + ").\n" +
      (d.manual ? "Entre com este e-mail e a senha que a coordenação te passou. Se preferir, toque em \"Esqueci a senha\" para criar a sua.\n" : "Abra o app e entre com seu e-mail e senha.\n");
  } else if (d.tipo === "acessoRecusado" && para) {
    destino = para; assunto = "ParqueTEC: pedido de acesso não aprovado";
    corpo = "Olá, " + t(d.nome, 60) + ".\n\nA coordenação não aprovou seu pedido de acesso ao ParqueTEC. Se achar que foi engano, fale com a coordenação.";
  } else if (d.tipo === "agendamentoAprovado" && para) {
    destino = para; assunto = "ParqueTEC: agendamento aprovado";
    corpo = "Olá, " + t(d.pessoa, 60) + ".\n\nA coordenação aprovou seu agendamento de " + t(d.data) + ", " + t(d.aula) + " (" + t(d.itens, 200) + ").\n" +
      "Na hora de pegar os equipamentos, abra o app e toque em Retirar, em Painel → Agendados para hoje.";
  } else if (d.tipo === "recusado" && para) {
    destino = para; assunto = "ParqueTEC: agendamento recusado";
    corpo = "Olá, " + t(d.pessoa, 60) + ".\n\nA coordenação recusou seu agendamento de " + t(d.data) + ", " + t(d.aula) + " (" + t(d.itens, 200) + ").\nSe precisar, fale com a coordenação ou faça um novo agendamento.";
  } else {
    return resp("tipo desconhecido");
  }

  // Limites para o endereço nunca virar fonte de spam.
  const props = PropertiesService.getScriptProperties();
  const hoje = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  const kTotal = "enviados_" + hoje, kPessoa = "p_" + hoje + "_" + destino;
  const total = Number(props.getProperty(kTotal) || 0), daPessoa = Number(props.getProperty(kPessoa) || 0);
  if (total >= LIMITE_POR_DIA) return resp("limite do dia");
  if (destino !== COORDENACAO && daPessoa >= LIMITE_POR_PESSOA) return resp("limite da pessoa");

  MailApp.sendEmail(destino, assunto, corpo + "\n\nAbrir o app: " + APP + "\n\n— ParqueTEC · COG Ensino Integral");
  props.setProperty(kTotal, String(total + 1));
  props.setProperty(kPessoa, String(daPessoa + 1));
  return resp("ok");
}

function resp(texto) { return ContentService.createTextOutput(texto); }
