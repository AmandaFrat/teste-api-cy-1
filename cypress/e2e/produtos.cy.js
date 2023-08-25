///<reference types="cypress" />
import contrato from '../contracts/produtos.contract'

describe('Teste da Funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn =>{ token = tkn})
    });

    it('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(Response =>{
            return contrato.validateAsync(Response.body)
        })
    });

    it('Listar Produtos', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((Response) =>{
            expect(Response.body.produtos[0].nome).to.equal('Produto EBAC 83577913')
            expect(Response.status).to.equal(200)
            expect(Response.body).to.have.property('produtos')
            expect(Response.duration).to.be.lessThan(35)
        })
        
    });

    it('Cadastrar produto', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.request({
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 600,
                "descricao": "Cadeira",
                "quantidade": 200
              },
              headers: {authorization: token}

        }).then((Response) =>{
            expect(Response.status).to.equal(201)
            expect(Response.body.message).to.equal('Cadastro realizado com sucesso')
        })

    });

    it('Deve validar mensangem de erro ao cadastrar produto repetido', () => {
        cy.cadastrarProduto(token, "Cadeira Gamer", 600, "Descrição do produto novo", 200)
        .then((Response) =>{
            expect(Response.status).to.equal(400)
            expect(Response.body.message).to.equal('Já existe produto com esse nome')
        })
        
    });

    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos').then(Response =>{
            let id = Response.body.produtos[13]._id
            cy.request({
                method:'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": "Produtos EBAC NOVO",
                    "preco": 470,
                    "descricao": "Produto editado",
                    "quantidade": 381
                  }
            }).then(Response => {
                expect(Response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 600, "Descrição do produto novo", 200).then(Response =>{
            let id = Response.body._id

            cy.request({
                method:'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body: {
                    "nome": produto,
                    "preco": 400,
                    "descricao": "Produto editado",
                    "quantidade": 300
                  }
            }).then(Response => {
                expect(Response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve deletar um produto previamente cadastrado', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000000)}`
        cy.cadastrarProduto(token, produto, 600, "Descrição do produto novo", 200)
        .then(Response =>{
            let id = Response.body._id
            cy.request({
                method: 'DELETE',
                url: `produtos/${id}`,
                headers: {authorization: token}
            }).then(Response =>{
                expect(Response.body.message).to.equal('Registro excluído com sucesso')
                expect(Response.status).to.equal(200)
            })
        })
    });
    
});