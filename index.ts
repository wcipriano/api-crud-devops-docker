import dotenv from 'dotenv'  
//require("dotenv").config({ path: '.env' });
import express, {NextFunction, Request, Response} from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose, {Error as MongooseError} from 'mongoose'; 

dotenv.config()
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// DB Conn process.env.MONGO_URI
//         'mongodb://mongo:27017/clientes'
mongoose.connect(process.env.MONGO_URI, {}).then(()=>{
    console.log(`connection to database established`)
}).catch(err=>{
    console.log(`db error ${err.message}`);
    process.exit(-1)
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'))

// Mongose Schema
const CustomerSchema = new mongoose.Schema({
    nome: String,
    endereco: String,
    email: String,
    telefone: String,
})

// Model Mongoose
const Cliente = mongoose.model('Clientes', CustomerSchema);

//Rotas
app.get('/clientes', async(req:Request, res:Response) => {
    try {
        const clientes = await Cliente.find();
        res.json(clientes);
    }
    catch (error) {
        console.error('Ocorreu um erro na consulta: ', error);
        res.status(500).json({error: 'Erro na consulta'});
    }
})

app.post('/clientes', async(req:Request, res:Response) => {
    try {
        const novoCliente = new Cliente(req.body);
        const resultado = await novoCliente.save();
        res.json(resultado);
    }
    catch (error) {
        console.error('Erro ao inserir cliente: ', error);
        res.status(500).json({error: 'Erro ao inserir cliente'});
    }
})

app.get('/clientes/:id', async(req:Request, res:Response) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if(!cliente) {
            res.status(404).json({error: 'Cliente nao encontrado'});
        }
        res.json(cliente);
    }
    catch (error) {
        console.error('Ocorreu um erro na consulta: ', error);
        res.status(500).json({error: 'Erro na consulta'});
    }
})

app.put('/clientes/:id', async(req:Request, res:Response) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, {new: true });
        if(!cliente) {
            res.status(404).json({error: 'Cliente nao encontrado'});
        }
        res.json(cliente);
    }
    catch (error) {
        console.error('Ocorreu um erro na consulta: ', error);
        res.status(500).json({error: 'Erro na consulta'});
    }
})

app.delete('/clientes/:id', async(req:Request, res:Response) => {
    try {
        const cliente = await Cliente.findByIdAndDelete(req.params.id);
        if(!cliente) {
            res.status(404).json({error: 'CMarialiente nao encontrado'});
        }
        res.json(cliente);
    }
    catch (error) {
        console.error('Ocorreu um erro na consulta: ', error);
        res.status(500).json({error: 'Erro na consulta'});
    }
})

app.get('/clientes/nome/:nome', async(req:Request, res:Response) => {
    try {
        const nome = req.params.nome;
        const dicre = { $regex: `.*${nome}.*`};
        console.log(dicre);
        const clientes = await Cliente.find({nome: dicre});
        res.status(200).json(clientes);
    }
    catch (error) {
        console.error('Ocorreu um erro na consulta: ', error);
        res.status(500).json({error: 'Erro na consulta'});
    }
})

// Tratamento de erro global
app.use((err: Error, req:Request, res:Response, next:NextFunction) => {
    console.error('Erro no servidor: ', err);
    res.status(500).json({error: 'Erro interno no servidor'});
})

// Iniciando o servidor 
console.log('PORT:       ', process.env.PORT);
console.log('MONGO_URI:: ', process.env.MONGO_URI);

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})
