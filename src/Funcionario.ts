import NivelPermissao from "./enum/NivelPermissao";
import * as path from "path";
import * as fs from "fs";

const DATA_FILE = path.join(__dirname, "../data/funcionarios.json");

export default class Funcionario{
    id: string
    nome: string
    telefone: string
    endereco: string
    usuario: string
    senha:string
    nivelPermissao: NivelPermissao

    constructor(id: string, nome: string, telefone: string, endereco: string, usuario: string, senha: string, nivelPermissao: NivelPermissao) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.endereco = endereco;
        this.usuario = usuario;
        this.senha = senha;
        this.nivelPermissao = nivelPermissao;
    }

    autenticar(usuario:string, senha:string): boolean{
        return this.usuario == usuario && this.senha == senha;
    }

    salvar(): void{
        const todos = Funcionario.carregarTodos();
        const index = todos.findIndex((f) => f.id === this.id);
        if (index >= 0){
            todos[index] = this;
        }
        else {
            todos.push(this)
        }
        if(!fs.existsSync(path.dirname(DATA_FILE))) {
            fs.mkdirSync(path.dirname(DATA_FILE), {recursive: true})
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), "utf-8");
    }

    carregar(): void{
    const todos = Funcionario.carregarTodos();
    const encontrado = todos.find((f) => f.id === this.id);
    if (encontrado) {
      Object.assign(this, encontrado);
    }
    }

    static carregarTodos(): Funcionario[] {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const dados = JSON.parse(raw);
    return dados.map(
      (d: any) =>
        new Funcionario(
          d.id,
          d.nome,
          d.telefone,
          d.endereco,
          d.usuario,
          d.senha,
          d.nivelPermissao
        )
    );
  }

  static buscarPorUsuario(usuario: string): Funcionario | undefined {
    return Funcionario.carregarTodos().find((f) => f.usuario === usuario);
  }

  static deletar(id: string): boolean {
    const todos = Funcionario.carregarTodos()
    const novos = todos.filter((f) => f.id !== id)
    if (novos.length === todos.length) return false
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(novos, null, 2), "utf-8")
    return true
  }
}