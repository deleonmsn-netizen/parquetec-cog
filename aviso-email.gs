// Aviso por e-mail do ParqueTEC.
// Como instalar ou atualizar (logado no Gmail da coordenação):
// 1. Abra https://script.google.com e o projeto do ParqueTEC (ou "Novo projeto" na primeira vez).
// 2. Apague o que estiver lá, cole todo este arquivo e clique em Salvar.
// 3. Primeira vez: Implantar → Nova implantação → engrenagem → "App da Web".
//    Executar como: "Eu". Quem pode acessar: "Qualquer pessoa". Implantar e autorizar.
//    Atualização: Implantar → Gerenciar implantações → lápis → Versão: "Nova versão" → Implantar.
//    (Assim o endereço continua o mesmo.)
// 4. Na primeira vez, copie o "URL do app da Web" e coloque no campo avisoEmail do config.js.
//
// Aviso de atraso mesmo com o app fechado (feito uma vez só):
// a) No app, em Gerenciar → Acessos → Dar acesso, crie um login só para os avisos:
//    nome "Avisos automáticos", e-mail gomescomendadoroliveira+avisos@gmail.com,
//    uma senha forte e perfil Professor.
// b) Aqui no script, clique na engrenagem (Configurações do projeto) → Propriedades do script
//    → Adicionar propriedade: ROBO_EMAIL com o e-mail acima e ROBO_SENHA com a senha. Salve.
// c) Volte ao código (ícone < >), escolha a função "instalarVerificacao" no menu ao lado de
//    "Depurar" e clique em Executar. Autorize. Pronto: a cada hora o script confere
//    os atrasos e manda os e-mails, mesmo com todos os aparelhos desligados.

const COORDENACAO = "gomescomendadoroliveira@gmail.com";
const APP = "https://deleonmsn-netizen.github.io/parquetec-cog/";
const LIMITE_POR_DIA = 80;        // e-mails no total, por dia
const LIMITE_POR_PESSOA = 6;      // e-mails para o mesmo professor, por dia
const FIREBASE = { apiKey: "AIzaSyBdRhfaEtocV1wju49HF1FQMto8ogcFBRk", projeto: "teccog-ff300", escola: "principal" };

function doPost(e) {
  let d = {};
  try { d = JSON.parse(e.postData.contents || "{}"); } catch (err) { return resp("inválido"); }
  const m = montar(d);
  return resp(m ? enviar(m.destino, m.assunto, m.corpo) : "tipo desconhecido");
}

// Monta o e-mail de cada tipo de aviso.
function montar(d) {
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
    return null;
  }
  return { destino, assunto, corpo };
}

// Limites para o endereço nunca virar fonte de spam.
function enviar(destino, assunto, corpo) {
  const props = PropertiesService.getScriptProperties();
  const hoje = Utilities.formatDate(new Date(), "America/Sao_Paulo", "yyyy-MM-dd");
  const kTotal = "enviados_" + hoje, kPessoa = "p_" + hoje + "_" + destino;
  const total = Number(props.getProperty(kTotal) || 0), daPessoa = Number(props.getProperty(kPessoa) || 0);
  if (total >= LIMITE_POR_DIA) return "limite do dia";
  if (destino !== COORDENACAO && daPessoa >= LIMITE_POR_PESSOA) return "limite da pessoa";

  MailApp.sendEmail(destino, assunto, corpo + "\n\nAbrir o app: " + APP + "\n\n— ParqueTEC · COG Ensino Integral");
  props.setProperty(kTotal, String(total + 1));
  props.setProperty(kPessoa, String(daPessoa + 1));
  return "ok";
}

function resp(texto) { return ContentService.createTextOutput(texto); }

// ---------- Atrasos com o app fechado ----------

// Rode esta função uma vez (Executar). Ela liga a conferência a cada hora.
function instalarVerificacao() {
  ScriptApp.getProjectTriggers().filter(function (g) { return g.getHandlerFunction() === "verificarAtrasos"; }).forEach(function (g) { ScriptApp.deleteTrigger(g); });
  ScriptApp.newTrigger("verificarAtrasos").timeBased().everyHours(1).create();
  Logger.log("Pronto. A conferência roda a cada hora. Agora: " + verificarAtrasos());
}

// Confere as retiradas em aberto e avisa (uma vez só por retirada) as que passaram do prazo.
function verificarAtrasos() {
  const props = PropertiesService.getScriptProperties();
  const email = props.getProperty("ROBO_EMAIL"), senha = props.getProperty("ROBO_SENHA");
  if (!email || !senha) throw new Error("Faltam ROBO_EMAIL e ROBO_SENHA em Configurações do projeto → Propriedades do script.");
  const login = JSON.parse(UrlFetchApp.fetch("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + FIREBASE.apiKey, {
    method: "post", contentType: "application/json", muteHttpExceptions: true,
    payload: JSON.stringify({ email: email, password: senha, returnSecureToken: true })
  }).getContentText());
  if (!login.idToken) throw new Error("O login dos avisos não entrou (" + (login.error ? login.error.message : "sem resposta") + "). Confira ROBO_EMAIL e ROBO_SENHA e se ele tem acesso no app.");
  const raiz = "https://firestore.googleapis.com/v1/";
  const base = raiz + "projects/" + FIREBASE.projeto + "/databases/(default)/documents/escolas/" + FIREBASE.escola;
  const cab = { Authorization: "Bearer " + login.idToken };
  const q = UrlFetchApp.fetch(base + ":runQuery", {
    method: "post", contentType: "application/json", headers: cab, muteHttpExceptions: true,
    payload: JSON.stringify({ structuredQuery: { from: [{ collectionId: "emprestimos" }], where: { fieldFilter: { field: { fieldPath: "aberto" }, op: "EQUAL", value: { booleanValue: true } } } } })
  });
  if (q.getResponseCode() !== 200) throw new Error("Não deu para ler as retiradas: " + q.getContentText().slice(0, 300));
  const agora = Date.now(); let n = 0;
  JSON.parse(q.getContentText()).forEach(function (item) {
    const doc = item.document; if (!doc) return;
    const e = valor({ mapValue: { fields: doc.fields || {} } });
    if (e.atrasoAvisado) return;
    const dev = e.devolvidos || {}, marcados = e.aDevolver || {};
    const faltam = (e.codes || []).filter(function (c) { return !dev[c] && !marcados[c]; });
    const prazo = Number(e.devolverAte) || fimDoDia(Number(e.retiradoEm));
    if (!faltam.length || !(agora > prazo)) return;
    // Marca antes de mandar. As regras do Firebase só deixam marcar uma vez: o app e o script nunca avisam duas vezes.
    const marca = UrlFetchApp.fetch(raiz + doc.name + "?updateMask.fieldPaths=atrasoAvisado&currentDocument.exists=true", {
      method: "patch", contentType: "application/json", headers: cab, muteHttpExceptions: true,
      payload: JSON.stringify({ fields: { atrasoAvisado: { integerValue: String(agora) } } })
    });
    if (marca.getResponseCode() !== 200) return;
    const tipo = String(faltam[0]).slice(0, 2) === "TB" ? ["tablet", "tablets"] : ["notebook", "notebooks"];
    const dados = { tipo: "atraso", pessoa: e.pessoaNome, itens: faltam.length + " " + tipo[faltam.length === 1 ? 0 : 1], codigos: faltam.join(", "),
      prazo: Utilities.formatDate(new Date(prazo), "America/Sao_Paulo", "dd/MM 'às' HH:mm") };
    const m1 = montar(dados); enviar(m1.destino, m1.assunto, m1.corpo);
    if (e.responsavelEmail) { dados.para = e.responsavelEmail; const m2 = montar(dados); enviar(m2.destino, m2.assunto, m2.corpo); }
    n++;
  });
  return n + (n === 1 ? " aviso de atraso enviado." : " avisos de atraso enviados.");
}

// Sem prazo marcado: fim do dia da retirada, no horário de Brasília.
function fimDoDia(t) { return new Date(Utilities.formatDate(new Date(t || Date.now()), "America/Sao_Paulo", "yyyy-MM-dd'T'23:59:00") + "-03:00").getTime(); }

// Converte um valor do Firestore (formato da API) em valor comum.
function valor(v) {
  if (!v) return null;
  if ("mapValue" in v) { const o = {}, f = v.mapValue.fields || {}; Object.keys(f).forEach(function (k) { o[k] = valor(f[k]); }); return o; }
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(valor);
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return v.booleanValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return new Date(v.timestampValue).getTime();
  return null;
}
