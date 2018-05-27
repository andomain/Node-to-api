const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const { Todo } = require('../models/Todo');

const testData = [{
    text: 'todo1'
},{
    text: 'todo2'
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(testData);
    }).then(() => done());
});

describe('POST /todos', () => {
    const originalLength = testData.length;
    it('should create a new Todo', (done) => {
        const text = 'Test todo text';
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) return done(err);

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(originalLength + 1);
                    expect(todos[originalLength].text).toBe(text);
                    done();
                }).catch(e => done(e));
            })
    });

    it('should not create an invalid Todo', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find().then((todos) =>{
                    expect(todos.length).toBe(testData.length);
                    done();
                }).catch(e => done(e));
            })
    })
});

describe('GET /todos', () => {
    it('should get all Todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(testData.length);
            }).end(done());
    })
});