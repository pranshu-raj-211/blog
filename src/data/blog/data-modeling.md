---
author: Pranshu Raj
pubDatetime: 2025-04-13T15:22:00.866Z
title: A quick introduction to data modeling in real world applications
slug: data-modeling
featured: true
draft: false
tags:
  - Data
  - MongoDB
description: What data modeling is, why it's so useful, how can we do it effectively to get the best results for our use case.
---

Data modeling is one of those obscure topics that everyone has an idea of but no one can't really explain in detail what it's all about. In the last few interviews I had, I was asked a lot of questions on this topic, which led me to learn more about this topic and how it's done, what the key considerations are and specifics regarding this concept when applied to different kinds of databases.

## So, what is it, really?

Data modeling can be defined as understanding what data is relevant to the use case, the way that data is going to be represented and worked with (in context of our use case), and how to represent this 'model' of the system to others.

Basically create a simplified model of what the use case needs and how data and system components are going to interact.

As we have real world entities, we want to map them to some concept in our database. This can be a person, books, ships or anything that we want to represent.

Both tangible (people, cars, houses) and intangible (loans, accounts) entities are considered, as per needs of the system. These are generally represented as tables in Relational databases like Postgres, and collections in Document databases like MongoDB.

(The original Relational model uses entity sets to refer to what we are calling entities.)

Specific examples of these entities are called as Entity instances - a particular person or bank account or book.

Attributes are things that describe an entity. Examples are - (name, author, ISBN, price) for a book.

Relationships define connections between entities. For example books are connected to authors and genres.

# The data modeling process

As with all sw processes, we should start by talking about some key considerations to keep in mind when designing a data model.

1. **Understand application requirements and workload**
   What kind of data entities are required, what relationships exist between them, how will this kind of data be accessed (access patterns - queries). This is the most important part of the data modelling process.

   Some more nuanced stuff when it comes to this part are estimation of data sizes, listing all potential operations ranked by importance, estimates of the number of queries running per day, etc.

2. **Mapping entities and relationships**
   In this phase we build a basic schema that defines entities under consideration by our system and the relationships between them. The kind of relationship between entities is also important.

   This is usually done through a diagrammatic representation, using ER diagrams for relational dbs and Collection relationship diagrams for mongodb.

3. **Apply relevant design patterns**
   This requires some domain expertise, as you'll need to find suitable design patterns based on your use case (access patterns defined in the first step), map them out to your specific data model and refine it based on the design pattern being used.

## Interesting things in modelling data for MongoDB

Mongo is not a relational database, so you don't have the concept of foreign keys there. But we still need to define relationships between different kinds of entities, which is where linking and embedding are useful.

Linking is where we place some unique field of one entity to link it to another entity. This is usually done by referencing id (or a bunch of ids) of documents of one collection in another collection. It looks somewhat like this:

Embedding is when you put the whole object (or objects) into the entity it has a relationship with. So object of one entity can contain fully one or more objects of another entity type. This is pretty useful when the other entities are required along with the first, which saves time while querying.

Decisions on whether to link or embed are made by understanding the way the data is going to be accessed. You'll need to consider whether data is queried using embedded info, how often will the embedded info really be used and the frequency of updates to the embedded data.

A hybrid of link and embed can be used, depending on the use case where some entities need to be accessed together frequently but some are rarely needed while querying the parent entity.

Link and embed are somewhat parallel to normalization and denormalization concepts in relational databases.
