import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db;
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch(err => console.log(err.message));

const schemaRegister = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(3).required()
});

const schemaLogin = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

const schemaTransation = joi.object({
    value: joi.number().greater(0).precision(2).required(),
    description: joi.string().required(),
    type: joi.string().valid("in", "out").required()
})

const day = dayjs().format("DD-MM");

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const validation = schemaRegister.validate( req.body, { abortEarly: false });
    if( validation.error ) return res.status(422).send({message: "Todos os campos são obrigatórios! A senha deve ter no mínimo 3 caracteres."})

    try {

        const user = await db.collection("users").findOne({ email });
        if( user ) return res.status(409).send({ message: "Este email já está em uso" });

        const hash = bcrypt.hashSync(password, 10);
        const body = { name, email, password: hash};

        await db.collection("users").insertOne(body);
        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/signin", async (req,res) => {
    const { email, password } = req.body;
    const validation = schemaLogin.validate(req.body, { abortEarly: false });
    if( validation.error ) return res.status(422).send({ message: "Todos os campos são obrigatórios e o email deve ser válido."});

    try{

        const user = await db.collection("users").findOne({ email });
        if ( !user ) return res.status(404).send({ message: "Email não encontrado"});

        const correctPassword = bcrypt.compareSync(password, user.password);
        if ( !correctPassword ) return res.status(401).send({ message: "Senha incorreta."});

        await db.collection("session").deleteMany({ userId: user._id });
        const token = uuid();
        const body = { token, userId: user._id };
        await db.collection("session").insertOne( body );

        res.status(200).send({ token, name: user.name });

    } catch (err) {
        res.status(500).send(err.message)
    }
})

app.post("/transation", async (req, res) => {
    const { value, description, type } = req.body;
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if( !token ) return res.sendStatus(401);

    const validation = schemaTransation.validate(req.body, { abortEarly: false });
    if( validation.error ) return res.status(422).send("Todos os campos são obrigatórios!");

    try {

        const session = await db.collection("session").findOne({ token });
        if ( !session ) return res.sendStatus(401);

        const user = await db.collection("users").findOne({_id: session.userId});

        const body = { value, description, type, day, name: user.name };
        console.log(body)

        await db.collection("transations").insertOne(body);

        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message)
    }
});

app.get("/transation", async (req, res) => {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if ( !token ) return res.sendStatus(401);

    try {

        const session = await db.collection("session").findOne({ token });
        if ( !session ) return res.sendStatus(401);
        const user = await db.collection("users").findOne({_id: session.userId});

        const transations = await db.collection("transations").find({ name: user.name }).toArray()
        
        res.status(200).send(transations);

    } catch (err) {
        res.status(500).send(err.message)
    }
})


const port = process.env.PORT;
app.listen(port, console.log(`Rodando na porta ${port}`));