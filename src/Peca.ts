import TipoPeca from "./enum/TipoPeca";
import StatusPeca from "./enum/StatusPeca";

export default class Peca{
    nome: string
    tipo: TipoPeca
    fornecedor: string
    status: StatusPeca

    constructor(nome:string, tipo:TipoPeca, fornecedor:string, status: StatusPeca) {
        this.nome = nome
        this.tipo = tipo
        this.fornecedor = fornecedor
        this.status = status
    }

    atualizarStatus(novoStatus: StatusPeca): void{
        this.status = novoStatus
        console.log(`Status da peça "${this.nome}" atualizado para "${novoStatus}" `)
    }

    salvar(): object{
        return {
            nome: this.nome,
            tipo: this.tipo,
            fornecedor: this.fornecedor,
            status: this.status
        }
    }

    static carregar(bazinga:any): Peca{
        return new Peca(bazinga.nome, bazinga.tipo, bazinga.fornecedor, bazinga.status)
    }
}