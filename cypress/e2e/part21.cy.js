import * as faker from 'faker';

describe('User Registration', () => {
  let user;
  let accessToken;
  before(() => {
    user = {
      email: faker.internet.email(),
      password: faker.internet.password()
    };
  });

  it('Register a new user', () => {
    cy.request('POST', '/register', user).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('accessToken');
      accessToken = response.body.accessToken;
      const data = JSON.stringify({ accessToken, user });

      cy.writeFile('UsersTocken.json', data);
      cy.log(user);
    });
});


  it('1. Get all posts', () => {
    cy.log(`all posts`);
  
    cy.request('GET', `/posts`).then(response => {
    expect(response.status).to.be.equal(200);
    cy.log(response.body);
    });
  });


  it('2. Get only firtst 10 posts', () => {
      cy.request('GET', `/posts?limit=10`).then(response => {
      expect(response.status).to.be.equal(200);
      cy.log(response.body);
    });
  });


   it('3. Get posts with id = 55 and id = 60', () => {
      cy.request('GET', `/posts?id=50&id=60`).then(response => {
      expect(response.status).to.be.equal(200);
      cy.log(response.body);
    });
  });

 
  it('4. Create a POST code 401', () => {
    let post = {
      id: faker.random.number(),
      title: faker.company.name,
      author: faker.name.findName()
    };
    cy.request({
      method: 'POST',
      url: '/664/posts',
      body: post,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.equal(401);
      cy.log(response.status);
    });
  });


it('5. Create post with adding access token in header.', () => {
  cy.readFile('UsersTocken.json').then((fileContents) => {
    const registeredUser = fileContents;
    accessToken = registeredUser.accessToken;

    let post = {
      id: faker.random.number(),
      title: faker.company.name,
      author: faker.name.findName()
    };

    cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: post
    }).then((response) => {
      expect(response.status).to.equal(201);
      cy.log(response.status,{accessToken}); 
    });
});
});


it('6. Create post entity and verify that the entity is created.', () => {
  cy.readFile('UsersTocken.json').then((fileContents) => {
    const registeredUser = fileContents;
    accessToken = registeredUser.accessToken;
  cy.request('GET', '/posts').then((response) => {
    expect(response.status).to.equal(200);

    const posts = response.body;

      posts.forEach((post) => {
        post.postDate = ''; 
        cy.request({
          method: 'PUT',
          url: `/posts/${post.id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: post
        }).then((response) => {
          expect(response.body).to.have.property('postDate');
          expect(response.status).to.equal(200);
          cy.log(response.body); 

          });
        });
      });
  });
});

it('7. Update non-existing entity.', () => {
  cy.request('GET', '/posts').then((response) => {
    const posts = response.body;

    cy.wrap(posts).each((post) => {
      if (post.hasOwnProperty('wrongEntity')) {
        post.wrongEntity = 'Wrong entity exist';

        cy.request({
          method: 'PUT',
          url: `/posts/${post.id}`,
          body: post,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.status).to.equal(200);
          } else {
            expect(response.status).to.equal(404);
            cy.log(response.status);
          }
        });
      }
    });
  });
});


it('8. Create post entity and update the created entity.', () => {
  cy.readFile('UsersTocken.json').then((fileContents) => {
    const registeredUser = fileContents;
    accessToken = registeredUser.accessToken;

    cy.request('GET', '/posts').then((response) => {
      expect(response.status).to.equal(200);

      const posts = response.body;

      posts.forEach((post) => {
          someData: faker.hacker.words()
        

        cy.request({
          method: 'PUT',
          url: `/posts/${post.id}`,
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          body: post
        }).then((response) => {
          expect(response.body.someData).to.equal(post.someData);
          expect(response.status).to.equal(200);
          cy.log(response.body); 
        });
      });
    });
  });
});


it('9. Delete non-existing post entity.', () => {
  cy.readFile('UsersTocken.json').then((fileContents) => {
    const registeredUser = fileContents;
    const accessToken = registeredUser.accessToken;

    cy.request('GET', '/posts').then((response) => {
      expect(response.status).to.equal(200);
      const posts = response.body;

      cy.request({
        method: 'DELETE',
        url: '/posts',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: { missingEntity: 'Non-existent entity' },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.status).to.equal(200);  
        } else {
          expect(response.status).to.equal(404);
          cy.log(response.status); 
        }
      });
    });
  });
});


it('10. Create post entity, update the created entity, and delete the entity.', () => {

    cy.readFile('UsersTocken.json').then((fileContents) => {
      const registeredUser = fileContents;
      const accessToken = registeredUser.accessToken;
  
      cy.request('GET', '/posts').then((response) => {
        expect(response.status).to.equal(200);
  
        const posts = response.body;
  
        posts.forEach((post) => {
          const FakeAdress = faker.address.words();
  
          post.FakeAdress = FakeAdress;
  
          cy.request({
            method: 'PUT',
            url: `/posts/${post.id}`,
            headers: {
              Authorization: `Bearer ${accessToken}`
            },
            body: post
          }).then((response) => {
            expect(response.body.FakeAdress).to.equal(post.FakeAdress);
            expect(response.status).to.equal(200);
            cy.log('Entity is created and updated:', response.body);
  
            delete post.FakeAdress;
  
            cy.request({
              method: 'PUT',
              url: `/posts/${post.id}`,
              headers: {
                Authorization: `Bearer ${accessToken}`
              },
              body: post
            }).then((response) => {
              expect(response.status).to.equal(200);
              cy.log('FakeAdress is deleted from the post:', FakeAdress);
              cy.request({
                method: 'GET',
                url: `/posts/${post.id}`,
                failOnStatusCode: false
              }).then((response) => {
                expect(response.body.FakeAdress).to.be.undefined;
                cy.log('FakeAdress property not found in the post:', response.status);
            });
          });
        });
      });
    });
  });
});
});



