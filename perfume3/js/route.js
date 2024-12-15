var app = angular.module('myapp', ['ngRoute','angularUtils.directives.dirPagination']);

app.config(function($routeProvider){
    $routeProvider
    .when("/", {
        templateUrl: 'home.html',
    })
    .when("/view/products", {
        templateUrl: 'products.html',
        controller: 'ProductsController',
    })
    .when("/signup", {
        templateUrl: 'signup.html',
    })
    .when("/login", {
        templateUrl: 'login.html',
    })
    .when("/view/product/:id", {
        templateUrl: 'detail.html',
        controller: 'ProductDetailController',
    })
    .when("/register", {
        templateUrl: 'register.html',
        controller: 'register-controller',
    })
    .when("/login", {
        templateUrl: 'login.html',
        controller: 'login-controller',
    })
    .when("/logout", {
        template: '',
        controller: 'LogoutController',
    })
    .when("/cart/:id", {
        templateUrl: 'cart.html',
        controller: 'cart-controller',
    })
    .otherwise({
        redirectTo: '/',
    });
});
