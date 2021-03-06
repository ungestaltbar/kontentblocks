var BaseView = require('backend/Views/BaseControlView');
var tplLoggedInStatus = require('templates/backend/status/loggedin.hbs');
var Checks = require('common/Checks');

module.exports = BaseView.extend({
  id: 'loggedIn',
  controller: null,
  className: 'kb-status-loggedin',
  initialize: function (options) {
    this.moduleView = options.parent;
    this.listenTo(this.model, 'override:loggedinonly', this.rerender);
  },
  isValid: function () {
    if (!Checks.userCan(this.model.get('settings').cap)){
      return false;
    }
    if (KB.Environment && KB.Environment.postType === "kb-gmd" ){
      return false;
    }
    return true;
  },
  render: function () {
    this.$el.append(tplLoggedInStatus({model: this.model.toJSON(), i18n: KB.i18n}));
  },
  rerender: function () {
    this.$el.empty();
    this.render();
  }

});