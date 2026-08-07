Users

Purpose

Stores login information.

Columns

id

username

password_hash

role

created_at

Relationships

One user may create many orders.

--------------------------------

Orders

Purpose

Stores customer orders.

Relationships

One order

↓

Many order_items
