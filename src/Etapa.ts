import StatusEtapa from "./enum/StatusEtapa";
import Funcionario from "./Funcionario";

export default class Etapa {
    nome: string
    prazo: string
    status: StatusEtapa
    funcionarios: Funcionario[]

    constructor(nome:string, prazo:string, status:StatusEtapa, funcionarios:Funcionario[] = []){
        this.nome = nome
        this.prazo = prazo
        this.status = status
        this.funcionarios = funcionarios
    }

    iniciar(): void {
        if (this.status !== StatusEtapa.PENDENTE){
            console.log(`A etapa "${this.nome} não foi iniciada. Status atual: ${this.status}`)
            return
        }
        this.status = StatusEtapa.ANDAMENTO
        console.log(`Etapa "${this.nome}" iniciada.`)
    }

    finalizar(etapaAnterior?: Etapa): void {
        if (etapaAnterior && etapaAnterior.status !== StatusEtapa.CONCLUIDA){
            console.log(`Não é possível finalizar "${this.nome}". A etapa anterior "${etapaAnterior.nome}" ainda não foi concluída.`)
        }
        if (this.status !== StatusEtapa.ANDAMENTO) {
            console.log(`A etapa "${this.nome}" não pode ser finalizada. Status atual: ${this.status}`)
            return
        }
        this.status = StatusEtapa.CONCLUIDA
        console.log(`Etapa "${this.nome}" concluída.`)
    }

    associarFuncionario(f: Funcionario): void {
        const jaAssociado = this.funcionarios.some((func) => func.id === f.id)
        if (jaAssociado) {
            console.log(`Funcionário "${f.nome}" já está associado a esta etapa.`)
            return
        }
        this.funcionarios.push(f)
        console.log(`Funcionário "${f.nome}" associado à etapa "${this.nome}".`)
    }

    listarFuncionarios(): Funcionario[] {
        return this.funcionarios
    }

    salvar(): object {
        return {
            nome: this.nome,
            prazo: this.prazo,
            status: this.status,
            funcionarios: this.funcionarios.map((f) => f.id),
        }
    }

    static carregar(dados: any, todosFuncionarios: Funcionario[]): Etapa {
        const funcionarios = (dados.funcionarios || [])
            .map((id: string) => todosFuncionarios.find((f) => f.id === id))
            .filter(Boolean) as Funcionario[]
        return new Etapa(dados.nome, dados.prazo, dados.status, funcionarios);
    }
}