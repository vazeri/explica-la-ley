/**
 * LawController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

// Compare function to use with Array.sort()
// compares articles by the amount of annotations
// DESC order
var descCompareArticles = function(a, b) {
  if (a.annotations.length < b.annotations.length) return 1;
  if (a.annotations.length > b.annotations.length) return -1;
  return 0;
};

module.exports = {

  index: function(req, res) {
    var slug = req.param("tag");
    // Filter laws by tag
    Tag.findOne({slug: slug}).exec(function(err, tag) {
      // if tag found use it as filter
      var filterCriteria = tag ? {tag: tag.id} : {};
      if (err) return res.send((err, 500));
      Law.find(filterCriteria).exec(function(err, laws) {
        if (err) return res.send(err, 500);
        Tag.find().exec(function(err, tags) {
          if (err) return res.send(err, 500);
          res.locals.layout = 'layoutv2';
          res.view('law/index', {laws: laws, tags: tags});
        });
      });
    });
  },

  find: function(req, res) {
    var lawId = req.param("id");
    Law.findOne(lawId).exec(function(err, law) {
      if (err) { console.log('Error al buscar leyes:', err); return res.redirect('/') }
      if (!law) { console.log('Ley no encontrada'); return res.redirect('/'); }
      Article.find({sort: 'number ASC', law: lawId}).populate('annotations').exec(function(err, articles) {
        if (err) return res.send(err, 500);
        law.articles = articles;
        res.locals.layout = 'layoutv2';
        return res.view('law/find', {law: law});
      });
    });
  },

  newLaw: function(req, res) {
    Tag.find({}).exec(function(err, tags) {
      if (err) return res.send(500, err);
      res.locals.layout = 'layoutv2';
      return res.view('law/new', {tags: tags});
    });
  },

  edit: function(req, res) {
    Law.findOne(req.param('id')).exec(function(err, law) {
      if (err) return res.send(500, err);
      Tag.find({}).exec(function(err, tags) {
        if (err) return res.send(500, err);
        res.locals.layout = 'layoutv2';
        return res.view('law/edit', {law: law, tags: tags});
      });
    });
  },

  create: function(req, res) {
    Law.create({
      name: req.param('name'),
      summary: req.param('summary'),
      tag: req.param('tag')
    }).exec(function(err, law) {
      if (err) {
        console.log('Error al crear ley:', err);
        return res.send(500);
      }
      return res.redirect('/ley/law/new');
    });
  },
	
};
