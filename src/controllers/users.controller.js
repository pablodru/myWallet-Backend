import { db } from '../database/database.connection.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

export async function signup (req, res) {
    const { name, email, password } = req.body;

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
}

export async function signin (req,res) {
    const { email, password } = req.body;

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
}