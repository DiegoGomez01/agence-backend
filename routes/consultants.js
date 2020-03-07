var express = require('express');
var router = express.Router();
const auth = require('../auth');
const mysqlConnection  = require('../database.js');

// GET all consultants-------/

const queryGetConsultants = `
    select cu.co_usuario as 'id', no_usuario as 'name' from cao_usuario as cu join permissao_sistema ps on cu.co_usuario = ps.co_usuario
    where ps.co_sistema = '1' AND ps.in_ativo = 'S' AND ps.co_tipo_usuario in (1,2,3);
`;

router.get('/', async (req, res) => {
    const connection = await mysqlConnection.getConnection();
    const [rows, fields] = await connection.execute(queryGetConsultants);
    auth.returnMessage(res, 200, 'data', rows);
});

router.get('/report/:user/:init_date/:end_date', async (req, res) => {
    const receitaLiquita = await getReceitaLiquida(req, res);
    const custoFixo = await getCustoFixo(req, res);
    const comissao = await getComissao(req, res);
    const lucro = await getLucro(receitaLiquita, custoFixo, comissao);
    const data = {
        receitaLiquita: receitaLiquita,
        custoFixo: custoFixo,
        comissao: comissao,
        lucro: lucro
    }
    auth.returnMessage(res, 200, 'data', data);
});

async function getReceitaLiquida(req, res) {
    const { user, init_date, end_date } = req.params;
    query = `
        select distinct ROUND(sum(valor),0) as 'valor', MONTH(data_emissao) as 'mes', total_imp_inc from cao_fatura where co_os in (
            select distinct co_os from cao_os where co_usuario = ?
        ) AND data_emissao between ? and ? 
        group by MONTH(data_emissao) ORDER BY MONTH(data_emissao) ASC;
    `
    const connection = await mysqlConnection.getConnection();
    let [rows, fields] = await connection.execute(query, [user, init_date, end_date]);
    rows = await calculateTotalReceitaLiquida(rows);
    return rows;
}

async function calculateTotalReceitaLiquida(rows) {
    if(rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
            rows[i].total = Math.round(rows[i].valor - (rows[i].valor * (rows[i].total_imp_inc / 100)));
        }
    }
    return rows;
}

async function getCustoFixo(req, res) {
    const { user } = req.params;
    query = `select brut_salario from cao_salario where co_usuario = ?;`
    const connection = await mysqlConnection.getConnection();
    const [rows, fields] = await connection.execute(query, [user]);
    return rows;
}

async function getComissao(req, res) {
    const { user, init_date, end_date } = req.params;
    query = `
        select distinct ROUND(sum(valor),0) as 'valor', total_imp_inc, comissao_cn, MONTH(data_emissao) as 'mes' from cao_fatura where co_os in (
            select distinct co_os from cao_os where co_usuario = ?
        ) AND data_emissao between ? and ? 
        group by MONTH(data_emissao) ORDER BY MONTH(data_emissao) ASC;
    `
    const connection = await mysqlConnection.getConnection();
    let [rows, fields] = await connection.execute(query, [user, init_date, end_date]);
    rows = await calculateTotalComissao(rows);
    return rows;
}

async function calculateTotalComissao(rows) {
    if(rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
            rows[i].total = Math.round((rows[i].valor - (rows[i].valor * (rows[i].total_imp_inc / 100))) * rows[i].comissao_cn / 100);
        }
    }
    return rows;
}

async function getLucro(receitaLiquita, custoFixo, comissao) {
    const lucro = [];
    for (let i = 0; i < receitaLiquita.length; i++) {
        lucro.push({
            "mes": receitaLiquita[i].mes,
            "total": Math.round(receitaLiquita[i].total - (custoFixo[0].brut_salario + comissao[i].total))
        });
    }
    return lucro;
}

module.exports = router;
