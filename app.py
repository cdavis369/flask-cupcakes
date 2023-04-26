from flask import Flask, render_template, flash, redirect, render_template, jsonify, request
from flask_debugtoolbar import DebugToolbarExtension
from models import db, connect_db, Cupcake



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///cupcakes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = "SECRET!"
app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
debug = DebugToolbarExtension(app)

with app.app_context():
  connect_db(app)
  db.create_all()
  
@app.route('/')
def home_page():
  return render_template("index.html")

@app.route('/cupcake')
def view_cupcake():
  return render_template("cupcake.html")

@app.route('/cupcake/edit')
def edit_cupcake_form():
  return render_template("edit_cupcake.html")

@app.route('/api/cupcakes', methods=["GET", "POST"])
def get_cupcakes():
  if request.method == "POST":
    cc_data = request.get_json()
    flavor = cc_data['flavor']
    size = cc_data['size']
    rating = cc_data['rating']
    image = cc_data['image']
    cc = Cupcake(flavor=flavor, size=size, rating=rating, image=image)
    db.session.add(cc)
    db.session.commit()
    cc = Cupcake.query.order_by(Cupcake.id.desc()).first()
    return jsonify(cupcake = cc.serialize())
  else:
    cupcakes = [cc.serialize() for cc in Cupcake.query.all()]
    return jsonify(cupcakes=cupcakes)

@app.route('/api/cupcakes/<int:id>', methods=["GET","PATCH","DELETE"])
def handle_cupcake(id):
  cc = Cupcake.query.get(id)
  if request.method == "GET":
    return jsonify(cupcake = cc.serialize())
  elif request.method == "PATCH":
    cc_data = request.get_json()
    cc.flavor = cc_data["flavor"]
    cc.size = cc_data["size"]
    cc.rating = cc_data["rating"]
    cc.image = cc_data["image"]
    db.session.commit()
    cc = Cupcake.query.get(id)
    return jsonify(cupcake = cc.serialize())
  elif request.method == "DELETE":
    Cupcake.query.filter_by(id=id).delete()
    db.session.commit()
    return jsonify({"message":"deleted"})