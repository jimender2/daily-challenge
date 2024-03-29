from fastapi import FastAPI, Form
from pydantic import BaseModel
from fastapi.responses import HTMLResponse


from sqlalchemy import create_engine, text

import os
from dotenv import load_dotenv

from typing import Annotated


load_dotenv()

sqlURL = os.getenv("sql_url")

engine = create_engine(sqlURL)


class Answer(BaseModel):
    user: str
    answer: str


class Question(BaseModel):
    user: str


app = FastAPI()


@app.get("/", response_class=HTMLResponse)
async def r():
    return """<form action="/question" method="post">
  <div>
    <input type="text" id="user" name="user" />
  </div>

  <div class="button">
    <button type="submit">Send your message</button>
  </div>
</form>
"""


@app.post("/question")
async def postQuestionForm(user: str = Form(...)):
    return getQuestionForUser(user)


@app.post("/json/question")
async def getQuestionJSON(question: Question):
    user = question.user
    return getQuestion(user)


def getQuestionForUser(user):
    if user is None or len(user) == 0:
        return {"Error": "Provide a user"}

    result = getUser(user)

    if result == []:
        # if a question does not exist for the user for today, then we need to create a new question
        createQuestion(user)
        result = getUser(user)

    if result == []:
        return {"Error": "error generating a question for you"}

    # we only care about the first result. Everything else is considered to be garbage
    question = getQuestion(result[0][4])

    answered = True

    if result[0][2] is None or len(result[0][2]) == 0:
        answered = False

    # we should add in error handling here
    returnDict = {
        "name": question[0][1],
        "options": [
            {"name": question[0][2]},
            {"name": question[0][3]},
            {"name": question[0][4]},
            {"name": question[0][5]},
        ],
        "answeredAlready": answered,
    }
    return returnDict


@app.post("/answer")
async def postAnswer(user: str = Form(...), answer: str = Form(...)):

    return submitAnswerForUser(user, answer)


@app.post("/json/answer")
async def postAnswerJSON(userAnswer: Answer):

    print(userAnswer)

    user = userAnswer.user

    answer = userAnswer.answer

    return submitAnswerForUser(user, answer)


def submitAnswerForUser(user, answer):
    if user is None or len(user) == 0:
        return {"Error": "Provide a user"}

    if answer is None or len(answer) == 0:
        return {"Error": "Provide an answer"}

    result = getUser(user)

    if result == []:
        return {"Error": "You do not have a question today yet."}

    answered = True
    if result[0][2] is None or len(result[0][2]) == 0:
        answered = False

    if answered:
        return {"Error": "You already submitted an answer"}

    # we only care about the first result. Everything else is considered to be garbage
    question = getQuestion(result[0][4])

    correct = False
    if question[0][6].toLowerCase() == answer.toLowerCase():
        correct = True

    # go and update the database
    userSubmission(user, answer)

    return {"correct": correct}


def getUser(user):
    result = []

    with engine.connect() as conn:
        stmt = text(
            """SELECT * FROM answered WHERE "user" = :x and "dateassigned" = date(now())"""
        )
        stmt = stmt.bindparams(x=user)
        result = conn.execute(stmt).all()

    return result


def createQuestion(user):
    with engine.connect() as conn:
        stmt = text(
            """INSERT INTO public.answered
                    ("user", answer, "date", challenge, dateassigned)
                    VALUES(:x, '', now(), 1, now());"""
        )
        stmt = stmt.bindparams(x=user)
        conn.execute(stmt)
        conn.commit()


def getQuestion(id):
    result = []
    with engine.connect() as conn:
        stmt = text(
            """SELECT id, challenge, potentialanswer1, potentialanswer2, potentialanswer3, potentialanswer4, answer
            FROM public.challenges
            WHERE id = :x;"""
        )
        stmt = stmt.bindparams(x=id)
        result = conn.execute(stmt).all()

    return result


def userSubmission(user, answer):
    with engine.connect() as conn:
        stmt = text(
            """UPDATE public.answered
                    SET answer = :x
                    WHERE "user" = :y
                    AND "dateassigned" = date(now());"""
        )
        stmt = stmt.bindparams(x=answer, y=user)
        conn.execute(stmt)
        conn.commit()
