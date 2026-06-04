import * as fs from "fs";
import * as path from "path";
import TipoAeronave from "./enum/TipoAeronave";
import Peca from "./Peca";
import Etapa from "./Etapa";
import Teste from "./Teste";
import Funcionario from "./Funcionario";

const DATA_FILE = path.join(__dirname, "../data/aeronaves.json");

export default class Aeronave{
    codigo: string
    modelo: string
    tipo: TipoAeronave
    capacidade: number
    alcance: number
    pecas: Peca[]
    etapas: Etapa[]
    testes: Teste[]

    constructor(codigo:string, modelo:string, tipo:TipoAeronave, capacidade:number, alcance: number, pecas:Peca[] = [], etapas:Etapa[] = [], testes:Teste[] = []){
        this.codigo = codigo;
        this.modelo = modelo;
        this.tipo = tipo;
        this.capacidade = capacidade;
        this.alcance = alcance;
        this.pecas = pecas;
        this.etapas = etapas;
        this.testes = testes;    
    }

    detalhar(): void{
        console.log("=".repeat(50))
        console.log("Detalhes da Aeronave")
        console.log("=".repeat(50))
        console.log(`Código: ${this.codigo}`)
        console.log(`Modelo: ${this.modelo}`)
        console.log(`Tipo: ${this.tipo}`)
        console.log(`Capacidade: ${this.capacidade} passageiros`)
        console.log(`Alcance: ${this.alcance} km`)
        console.log(`Peças: ${this.pecas.length}`)
        console.log(`Etapas: ${this.etapas.length}`)
        console.log(`Testes: ${this.testes.length}`)
        console.log("=".repeat(50))
    }

    salvar(): void{
        const todas = Aeronave.carregarTodosRaw()
        const index = todas.findIndex((a: any) => a.codigo === this.codigo)
        const dados = {
            codigo: this.codigo,
            modelo: this.modelo,
            tipo: this.tipo,
            capacidade: this.capacidade,
            alcance: this.alcance,
            pecas: this.pecas.map((p) => p.salvar()),
            etapas: this.etapas.map((e) => e.salvar()),
            testes: this.testes.map((t) => t.salvar()),
        }
        if (index >= 0) {
            todas[index] = dados
        }
        else {
            todas.push(dados)
        }
        if (!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(todas, null, 2), "utf-8")
    }

    carregar(): void {
        const todas = Aeronave.carregarTodosRaw()
        const dados = todas.find((a: any) => a.codigo === this.codigo)
        if (dados) {
        const todosFuncionarios = Funcionario.carregarTodos()
            this.modelo = dados.modelo;
            this.tipo = dados.tip
            this.capacidade = dados.capacidade
            this.alcance = dados.alcance
            this.pecas = (dados.pecas || []).map((p: any) => Peca.carregar(p))
            this.etapas = (dados.etapas || []).map((e: any) => Etapa.carregar(e, todosFuncionarios)
        )
        this.testes = (dados.testes || []).map((t: any) => Teste.carregar(t))
        }
    }

    private static carregarTodosRaw(): any[] {
        if (!fs.existsSync(DATA_FILE)) return []
        const raw = fs.readFileSync(DATA_FILE, "utf-8")
        return JSON.parse(raw)
    }

    static carregarTodos(): Aeronave[] {
    const todosFuncionarios = Funcionario.carregarTodos()
    return Aeronave.carregarTodosRaw().map((d: any) => {
        return new Aeronave(
            d.codigo,
            d.modelo,
            d.tipo,
            d.capacidade,
            d.alcance,
            (d.pecas || []).map((p: any) => Peca.carregar(p)),
            (d.etapas || []).map((e: any) => Etapa.carregar(e, todosFuncionarios)),
            (d.testes || []).map((t: any) => Teste.carregar(t)))
            });
    }

    static buscarPorCodigo(codigo: string): Aeronave | undefined {
        return Aeronave.carregarTodos().find((a) => a.codigo === codigo)
    }

    static codigoExiste(codigo: string): boolean {
        return Aeronave.carregarTodosRaw().some((a: any) => a.codigo === codigo)
    }

    static deletar(codigo: string): boolean {
        const todas = Aeronave.carregarTodosRaw()
        const novas = todas.filter((a: any) => a.codigo !== codigo)
        if (novas.length === todas.length) return false
        if (!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(novas, null, 2), "utf-8")
        return true
    }
}