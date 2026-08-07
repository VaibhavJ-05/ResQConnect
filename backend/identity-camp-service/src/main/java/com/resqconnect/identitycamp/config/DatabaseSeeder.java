package com.resqconnect.identitycamp.config;

import com.resqconnect.identitycamp.models.Role;
import com.resqconnect.identitycamp.models.User;
import com.resqconnect.identitycamp.repositories.RoleRepository;
import com.resqconnect.identitycamp.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(RoleRepository roleRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(1, "Victim"));
            roleRepository.save(new Role(2, "Volunteer"));
            roleRepository.save(new Role(3, "NGO"));
            roleRepository.save(new Role(4, "Government Officer"));
            roleRepository.save(new Role(5, "Admin"));
            System.out.println("Default Roles Seeded!");
        }

        // Seed Admin User
        Optional<User> adminOpt = userRepository.findByEmail("admin@ResQConnect.com");
        if (adminOpt.isEmpty()) {
            User admin = new User();
            admin.setId(1);
            admin.setName("System Administrator");
            admin.setEmail("admin@resqconnect.com");
            admin.setPhone("9875648517");
            admin.setRoleId(5); // Admin
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("System Administrator Seeded!");
        } else {
            User admin = adminOpt.get();
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setRoleId(5); // Admin
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("System Administrator Password Reset to BCrypt!");
        }
    }
}
