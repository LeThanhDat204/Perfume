app.service('cartService', function ($http) {
    this.addToCart = function (productId) {
        var loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            // Chuyển hướng đến trang đăng nhập nếu chưa đăng nhập
            window.location.href = "#/login";
            return;
        }

        // Lấy thông tin người dùng đã đăng nhập
        loggedInUser = JSON.parse(loggedInUser);
        var userId = loggedInUser.id;

        return $http.get('https://665899635c36170526492729.mockapi.io/users/carts')
            .then(function (response) {
                var userIdsInCart = response.data.map(item => item.userId);

                // Kiểm tra xem userId của người dùng đăng nhập có trong danh sách userId từ carts hay không
                if (userIdsInCart.includes(userId)) {
                    return $http.get('https://665899635c36170526492729.mockapi.io/users/carts?userId=' + userId)
                        .then(function (response) {
                            var cartItems = response.data;
                            var existingItem = cartItems.find(item => item.productId === productId);
                            if (existingItem) {
                                // Sản phẩm đã tồn tại, tăng số lượng
                                existingItem.quantity += 1;
                                console.log(existingItem.quantity);

                                return $http.put('https://665899635c36170526492729.mockapi.io/users/carts/' + existingItem.id, existingItem)
                                    .then(function (response) {
                                        // Hiển thị thông báo thành công
                                        Swal.fire({
                                            title: 'Thành công!',
                                            text: 'Số lượng sản phẩm đã được cập nhật.',
                                            icon: 'success',
                                            confirmButtonText: 'OK'
                                        });
                                        return response.data;
                                    });
                            } else {
                                // Sản phẩm chưa tồn tại, thêm sản phẩm mới vào giỏ hàng
                                var cartItem = {
                                    userId: userId,
                                    productId: productId,
                                    quantity: 1
                                };
                                return $http.post('https://665899635c36170526492729.mockapi.io/users/carts', cartItem)
                                    .then(function (response) {
                                        // Hiển thị thông báo thành công
                                        Swal.fire({
                                            title: 'Thành công!',
                                            text: 'Sản phẩm đã được thêm vào giỏ hàng.',
                                            icon: 'success',
                                            confirmButtonText: 'OK'
                                        });
                                        return response.data;
                                    });
                            }
                        })
                        .catch(function (error) {
                            // Hiển thị thông báo lỗi
                            Swal.fire({
                                title: 'Lỗi!',
                                text: 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng.',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                            throw error;
                        });
                } else {
                    var cartItem = {
                        userId: userId,
                        productId: productId,
                        quantity: 1
                    };
                    return $http.post('https://665899635c36170526492729.mockapi.io/users/carts', cartItem)
                        .then(function (response) {
                            // Hiển thị thông báo thành công
                            Swal.fire({
                                title: 'Thành công!',
                                text: 'Sản phẩm đã được thêm vào giỏ hàng.',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            });
                            return response.data;
                        });
                }
            })
        // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
    };
});


app.controller('ProductsController', function ($scope, $http) {

    $scope.filteredProducts = [];
    $scope.products = [];

    $http.get('db/products.json').then(function (response) {
        // Lưu trữ mảng sản phẩm vào $scope.products
        $scope.products = response.data;
        var products = response.data; // Truy cập trực tiếp vào mảng sản phẩm
        var companies = {};

        // Lặp qua từng sản phẩm và nhóm theo công ty
        products.forEach(function (product) {
            if (!companies[product.company]) {
                companies[product.company] = {
                    name: product.company,
                    products: []
                };
            }
            companies[product.company].products.push(product);
        });

        // Chuyển đổi đối tượng companies thành mảng và gán vào $scope
        $scope.companies = Object.values(companies);
        $scope.filteredProducts = products;

        // Gọi hàm updateFilteredItems để cập nhật danh sách phân trang
        $scope.updateFilteredItems();
    });
    $scope.curPage = 1;
    $scope.itemsPerPage = 3;
    $scope.maxSize = 5;

    $scope.numOfPages = function () {
        return Math.ceil($scope.filteredProducts.length / $scope.itemsPerPage);
    };

    $scope.$watch('curPage + itemsPerPage', function () {
        $scope.updateFilteredItems();
    });


    $scope.updateFilteredItems = function () {
        var begin = (($scope.curPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;

        if ($scope.filteredProducts && $scope.filteredProducts.length) {
            $scope.filteredItems = $scope.filteredProducts.slice(begin, end);
        } else {
            $scope.filteredItems = [];
        }
    };


    $scope.filterProducts = function () {
        var filteredByCompany = $scope.products;
        if ($scope.selectedCompany) {
            filteredByCompany = $scope.products.filter(function (product) {
                return product.company === $scope.selectedCompany;
            });
        }

        var filteredByPrice = filteredByCompany;
        if ($scope.priceRange) {
            switch ($scope.priceRange) {
                case 'lessThan100':
                    filteredByPrice = filteredByCompany.filter(function (product) {
                        return product.price < 100;
                    });
                    break;
                case 'between100_200':
                    filteredByPrice = filteredByCompany.filter(function (product) {
                        return product.price >= 100 && product.price <= 200;
                    });
                    break;
                case 'moreThan200':
                    filteredByPrice = filteredByCompany.filter(function (product) {
                        return product.price > 200;
                    });
                    break;
                default:
                    filteredByPrice = filteredByCompany;
                    break;
            }
        }

        var filteredBySearch = filteredByPrice;
        if ($scope.searchQuery) {
            console.log("Search Query: ", $scope.searchQuery);
            filteredBySearch = filteredByPrice.filter(function (product) {
                return product.name.toLowerCase().includes($scope.searchQuery.toLowerCase()) ||
                    product.preview.toLowerCase().includes($scope.searchQuery.toLowerCase());
            });
        }

        $scope.filteredProducts = filteredBySearch;
        console.log('Filtered Products:', $scope.filteredProducts);


        $scope.updateFilteredItems();
    };


    $scope.filterProducts();
});



app.controller('ProductDetailController', function ($scope, $http, $routeParams, cartService) {
    $scope.addToCart = function (productId) {
        cartService.addToCart(productId);
    };
    var productId = $routeParams.id;
    $http.get('db/products.json').then(function (response) {
        var products = response.data;
        $scope.product = products.find(product => product.id == productId);
    });
    $http.get('db/products.json').then(function (response) {
        $scope.productsSpecial = response.data.filter(product => product.special === 1);
    });
});
app.controller('register-controller', function ($scope, $http, $location, $timeout) {
    $scope.user = {
        fullname: '',
        username: '',
        password: '',
        repassword: ''
    };

    $scope.submitForm = function () {

        if ($scope.user.password !== $scope.user.repassword) {
            swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Passwords do not match!',
            });
            return;
        }

        // lay API
        $http.get('https://665899635c36170526492729.mockapi.io/users/users')
            .then(function (response) {
                var usernames = response.data.map(function (user) {
                    return user.username;
                });


                if (usernames.includes($scope.user.username)) {
                    swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Username already exists!',
                    });
                } else {

                    var dataPost = {
                        fullname: $scope.user.fullname,
                        username: $scope.user.username,
                        password: $scope.user.password
                    };


                    $http.post('https://665899635c36170526492729.mockapi.io/users/users', dataPost)
                        .then(function (response) {
                            swal.fire({
                                icon: 'success',
                                title: 'Register Successful!',
                                text: 'Do you want to login ?',
                                showConfirmButton: false,
                                showCancelButton: true,
                                cancelButtonText: 'OK',
                                cancelButtonColor: '#d33'
                            }).then(function (result) {
                                if (result.dismiss === swal.DismissReason.cancel) {

                                } else {
                                    $location.path('/login');
                                }
                            });


                            $timeout(function () {
                                $location.path('/login');
                            }, 3000);
                        })
                        .catch(function (error) {
                            swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'An error occurred while registering!',
                            });
                        });
                }
            })
            .catch(function (error) {
                swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'An error occurred while fetching usernames!',
                });
            });
    };
});
app.controller('login-controller', function ($scope, $http, $timeout, $location) {
    $scope.user = {
        username: '',
        password: ''
    };

    $scope.login = function () {

        var username = $scope.user.username;
        var password = $scope.user.password;


        $http.get('https://665899635c36170526492729.mockapi.io/users/users')
            .then(function (response) {
                var users = response.data;


                var loggedInUser = users.find(function (user) {
                    return user.username === username && user.password === password;
                });

                if (loggedInUser) {

                    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
                    console.log(localStorage.getItem('loggedInUser'));
                    swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Redirecting to dashboard in 3 seconds...',
                        showConfirmButton: false
                    }).then(function () {
                        $location.path('/');
                    });

                    $timeout(function () {
                        $location.path('/');
                    }, 3000);
                } else {

                    swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Invalid username or password. Please try again!',
                    });
                }
            })
            .catch(function (error) {

                swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'An error occurred while logging in. Please try again later!',
                });
            });
    };
});
app.controller('LogoutController', function ($scope, $location) {
    // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem('loggedInUser');

    // Hiển thị thông báo đăng xuất thành công
    Swal.fire({
        title: 'Đăng xuất thành công!',
        text: "Bạn có muốn đăng nhập lại?",
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập',
        cancelButtonText: 'Trang chủ'
    }).then((result) => {
        if (result.isConfirmed) {
            // Chuyển đến trang đăng nhập
            $location.path('/login');
            $scope.$apply();
        } else {
            // Chuyển đến trang chủ
            $location.path('/');
            $scope.$apply();
        }
    });
});
app.controller('cart-controller', function ($scope, $http, $window) {
    // User ID mà bạn muốn lọc
    var userId = JSON.parse(localStorage.getItem('loggedInUser')).id;
    $scope.calculateTotalPrice = function () {
        var totalPrice = 0;
        $scope.cartDetails.forEach(function (item) {
            totalPrice += item.quantity * item.productPrice;
        });
        return totalPrice;
    };
    $scope.totalPrice = 0;
    $http.get('https://665899635c36170526492729.mockapi.io/users/carts')
        .then(function (response) {
            var allCarts = response.data;
            // Lọc giỏ hàng theo userId
            $scope.userCart = allCarts.filter(function (cart) {
                return cart.userId == userId;
            });

            // Nếu không có sản phẩm nào trong giỏ hàng
            if ($scope.userCart.length === 0) {
                $scope.cartDetails = {};
            } else {
                $http.get("https://665899635c36170526492729.mockapi.io/users/carts?userId=" + userId)
                    .then(function (response) {
                        // Lưu trữ các giỏ hàng của userId vào scope
                        var carts = response.data;
                        var productIds = carts.map(function (cart) {
                            return cart.productId;
                        });

                        // Lấy danh sách sản phẩm từ db/products.json
                        $http.get("db/products.json")
                            .then(function (response) {
                                var allProducts = response.data; // Truy cập vào mảng products
                                var productsInCart = allProducts.filter(function (product) {
                                    return productIds.includes(product.id);
                                });

                                // Kết hợp dữ liệu giỏ hàng và sản phẩm
                                $scope.cartDetails = carts.map(function (cart) {
                                    var product = productsInCart.find(function (product) {
                                        return product.id === cart.productId;
                                    });
                                    return {
                                        id: cart.id,
                                        productId: cart.productId,
                                        quantity: cart.quantity,
                                        userId: cart.userId,
                                        productName: product ? product.name : "Unknown Product",
                                        productPrice: product ? product.price : 0,
                                        productImage: product ? product.imgUrl : ""
                                    };
                                });
                                $scope.totalPrice = $scope.calculateTotalPrice();
                            }, function (error) {
                                console.error("Lỗi khi lấy dữ liệu sản phẩm:", error);
                            });
                    }, function (error) {
                        console.error("Lỗi khi lấy dữ liệu giỏ hàng:", error);
                    });
            }

        });
    // Gửi yêu cầu GET đến API để lấy tất cả các giỏ hàng của userId


    $scope.removeFromCart = function (itemId) {
        // Hiển thị hộp thoại xác nhận
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa?',
            text: 'Sản phẩm sẽ bị xóa khỏi giỏ hàng của bạn.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có, xóa nó!',
            cancelButtonText: 'Không, hủy bỏ'
        }).then((result) => {
            if (result.isConfirmed) {
                // Nếu người dùng xác nhận, tiến hành xóa
                $http.delete('https://665899635c36170526492729.mockapi.io/users/carts/' + itemId)
                    .then(function (response) {
                        // Hiển thị thông báo thành công
                        Swal.fire({
                            title: 'Thành công!',
                            text: 'Sản phẩm đã được xóa khỏi giỏ hàng.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                        // Reload lại trang
                        $window.location.reload();
                    })
                    .catch(function (error) {
                        // Hiển thị thông báo lỗi
                        Swal.fire({
                            title: 'Lỗi!',
                            text: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    });
            }
        });
    };
    $scope.decrease = function (id) {
        // Tìm kiếm sản phẩm trong giỏ hàng dựa vào id
        var item = $scope.cartDetails.find(item => item.id === id);
        if (item) {
            // Giảm số lượng nếu số lượng hiện tại lớn hơn 1
            if (item.quantity > 1) {
                item.quantity--;
                // Gửi yêu cầu PUT để cập nhật số lượng sản phẩm
                $http.put('https://665899635c36170526492729.mockapi.io/users/carts/' + item.id, item)
                    .then(function (response) {
                        // Xử lý sau khi cập nhật thành công
                    })
                    .catch(function (error) {
                        // Xử lý lỗi khi cập nhật không thành công
                    });
            }
            $scope.totalPrice = $scope.calculateTotalPrice();
        }
    };

    $scope.increase = function (id) {
        // Tìm kiếm sản phẩm trong giỏ hàng dựa vào id
        var item = $scope.cartDetails.find(item => item.id === id);
        if (item) {
            // Tăng số lượng sản phẩm và cập nhật vào giỏ hàng
            item.quantity++;
            // Gửi yêu cầu PUT để cập nhật số lượng sản phẩm
            $http.put('https://665899635c36170526492729.mockapi.io/users/carts/' + item.id, item)
                .then(function (response) {
                    // Xử lý sau khi cập nhật thành công
                })
                .catch(function (error) {
                    // Xử lý lỗi khi cập nhật không thành công
                });
        }
        $scope.totalPrice = $scope.calculateTotalPrice();
    };

});