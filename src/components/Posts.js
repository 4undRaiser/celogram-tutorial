import React from "react";
import { useState } from "react";
import { Card, Badge, Col, Stack, Button, Row } from "react-bootstrap";

export const Posts = (props) => {
  const [comment, setComment] = useState("");
  const [tipAmmount, setTipAmmount] = useState("");
  return (
    <Row xs={1} md={3} className="g-4">
      {props.posts.map((post) => (
        <Col key={post.index}>
          <Card className="h-100">
            <Card.Header>
              <Stack direction="horizontal" gap={2}>
                <Badge bg="secondary" className="ms-auto">
                  {post.index} ID
                </Badge>

                <Badge bg="secondary" className="ms-auto">
                  {post.likes} Likes
                </Badge>
              </Stack>
            </Card.Header>

            <div className=" ratio ratio-4x3">
              <img
                src={post.image}
                alt={post.description}
                style={{ objectFit: "cover" }}
              />
            </div>

            <Card.Body className="d-flex  flex-column text-center">
              <Card.Title>{post.title}</Card.Title>
              <Card.Text className="flex-grow-1">{post.description}</Card.Text>
              <Button
                variant="primary mt-2"
                onClick={() => props.like(post.index)}
              >
                Like this post
              </Button>

              <form>
                <div class="form-r">
                  <input
                    type="text"
                    class="form-control mt-3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="enter comment"
                  />
                  <button
                    type="button"
                    onClick={() => props.addComment(post.index, comment)}
                    class="btn btn-dark mt-1"
                  >
                    Comment on this post
                  </button>
                </div>
              </form>

              <form>
                <div class="form-r">
                  <input
                    type="number"
                    class="form-control mt-3"
                    value={tipAmmount}
                    onChange={(e) => setTipAmmount(e.target.value)}
                    placeholder="enter ammount"
                  />
                  <button
                    type="button"
                    onClick={() => props.sendTip(post.index, tipAmmount)}
                    class="btn btn-dark mt-1"
                  >
                    Send Tip(cUSD)
                  </button>
                </div>
              </form>
              <h2 className="mt-3">Comments</h2>
              {props.walletAddress === post.user &&
                post.comments.map((c) => (
                  <p class="card-text ">
                    {c.description} <hr />
                  </p>
                ))}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
