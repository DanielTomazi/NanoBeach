document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const topoLinks = document.querySelector('.topo-links');

    if (menuToggle && topoLinks) {
        menuToggle.addEventListener('click', () => {
            topoLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        document.querySelectorAll('.topo-links a').forEach(link => {
            link.addEventListener('click', () => {
                topoLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !topoLinks.contains(e.target)) {
                topoLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.topo').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            clearErrorMessages();
            
            const formData = new FormData(form);
            const submitBtn = document.querySelector('.btn-enviar');
            
            if (!validateFormClient(formData)) {
                return false;
            }
            
            showLoadingState(submitBtn);
            
            fetch('enviar.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                hideLoadingState(submitBtn);
                
                if (data.success) {
                    showSuccessMessage(data.message);
                    form.reset();
                } else {
                    showErrorMessage(data.message);
                    
                    if (data.errors) {
                        displayFieldErrors(data.errors);
                    }
                }
            })
            .catch(error => {
                hideLoadingState(submitBtn);
                console.error('Erro:', error);
                showErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
            });
        });
    }

    function validateFormClient(formData) {
        let isValid = true;
        const errors = {};
        
        const nome = formData.get('nome').trim();
        const email = formData.get('email').trim();
        const telefone = formData.get('telefone').trim();
        const dataIda = formData.get('data_ida');
        const dataVolta = formData.get('data_volta');
        const quantidadePessoas = parseInt(formData.get('quantidade_pessoas'));

        if (nome.length < 2) {
            errors.nome = 'Nome deve ter pelo menos 2 caracteres';
            isValid = false;
        }

        if (!isValidEmail(email)) {
            errors.email = 'E-mail inválido';
            isValid = false;
        }

        if (telefone.replace(/\D/g, '').length < 10) {
            errors.telefone = 'Telefone deve ter pelo menos 10 dígitos';
            isValid = false;
        }

        if (quantidadePessoas < 1 || quantidadePessoas > 50) {
            errors.quantidade_pessoas = 'Quantidade deve ser entre 1 e 50 pessoas';
            isValid = false;
        }

        if (dataIda && dataVolta) {
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            const ida = new Date(dataIda);
            const volta = new Date(dataVolta);

            if (ida < hoje) {
                errors.data_ida = 'Data de ida não pode ser anterior a hoje';
                isValid = false;
            }

            if (volta <= ida) {
                errors.data_volta = 'Data de volta deve ser posterior à data de ida';
                isValid = false;
            }

            const diffTime = Math.abs(volta - ida);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 30) {
                errors.data_volta = 'Período máximo de reserva é de 30 dias';
                isValid = false;
            }
        }

        if (!isValid) {
            displayFieldErrors(errors);
        }

        return isValid;
    }

    function displayFieldErrors(errors) {
        Object.keys(errors).forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.textContent = errors[fieldName];
                field.parentNode.appendChild(errorDiv);
            }
        });
    }

    function clearErrorMessages() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.success-message, .general-error').forEach(el => el.remove());
    }

    function showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #c3e6cb;
            text-align: center;
            font-weight: 600;
        `;
        
        const form = document.querySelector('form');
        form.parentNode.insertBefore(successDiv, form);
        
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            successDiv.remove();
        }, 10000);
    }

    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'general-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            border: 1px solid #f5c6cb;
            text-align: center;
            font-weight: 600;
        `;
        
        const form = document.querySelector('form');
        form.parentNode.insertBefore(errorDiv, form);
        
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showLoadingState(button) {
        if (button) {
            button.innerHTML = '<span>Enviando...</span>';
            button.disabled = true;
            button.style.opacity = '0.7';
        }
    }

    function hideLoadingState(button) {
        if (button) {
            button.innerHTML = 'Enviar Dados';
            button.disabled = false;
            button.style.opacity = '1';
        }
    }

    const telefoneInput = document.querySelector('input[name="telefone"]');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
            }
            e.target.value = value;
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.secao-conteudo').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    if (window.innerWidth > 768) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const background = document.querySelector('.secao-background-capa');
            if (background) {
                const speed = scrolled * 0.3;
                background.style.transform = `translateY(${speed}px)`;
            }
        });
    }

    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        document.addEventListener('touchstart', function() {}, {passive: true});
        document.addEventListener('touchmove', function() {}, {passive: true});
    }

    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (window.innerWidth <= 768) {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            }
        }, 250);
    });

    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const topoLinks = document.querySelector('.topo-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (topoLinks && topoLinks.classList.contains('active')) {
                topoLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        }
    });

    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        switch (fieldName) {
            case 'nome':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nome deve ter pelo menos 2 caracteres';
                }
                break;
            case 'email':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'E-mail inválido';
                }
                break;
            case 'telefone':
                if (value.replace(/\D/g, '').length < 10) {
                    isValid = false;
                    errorMessage = 'Telefone deve ter pelo menos 10 dígitos';
                }
                break;
            case 'quantidade_pessoas':
                const num = parseInt(value);
                if (num < 1 || num > 50) {
                    isValid = false;
                    errorMessage = 'Quantidade deve ser entre 1 e 50 pessoas';
                }
                break;
        }

        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            errorDiv.style.color = '#e74c3c';
            errorDiv.style.fontSize = '14px';
            errorDiv.style.marginTop = '5px';
            field.parentNode.appendChild(errorDiv);
        }

        return isValid;
    }
});
