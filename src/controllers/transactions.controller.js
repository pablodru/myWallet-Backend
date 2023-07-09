import { db } from "../database/database.connection.js";
import { schemaTransation } from "../schemas/transactions.schemas.js";
import dayjs from "dayjs";

const day = dayjs().format("DD-MM");

export async function newTransaction (req, res) {
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
}

export async function getTransactions (req, res) {
    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer ", "");

    if ( !token ) return res.sendStatus(401);

    try {

        const session = await db.collection("session").findOne({ token });
        if ( !session ) return res.sendStatus(401);
        const user = await db.collection("users").findOne({_id: session.userId});

        const transations = await db.collection("transations").find({ name: user.name }).toArray();
        const finalTransations = transations.reverse();
        
        res.status(200).send(finalTransations);

    } catch (err) {
        res.status(500).send(err.message)
    }
}